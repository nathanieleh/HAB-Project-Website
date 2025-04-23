import io
import ast
import json
import yaml
import argparse
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

# ---- Google Drive API Imports ----
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google_auth_oauthlib.flow import InstalledAppFlow

'''
Load YAML config file and return as a dictionary.
Args:
    file_path (str): Path to the YAML config file.
Returns:
    dict: Configuration parameters.
'''
def load_yaml(file_path):
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

'''
Read CSV file from Google Drive, clean the data, and impute missing values.
Args:
    file_name (str): Name of the CSV file in Google Drive.
Returns:
    pd.DataFrame: Cleaned DataFrame with imputed values.
'''
def clean_data(file_name):
    # ---- Read CSV file from Google Drive ----
    # Authentication
    SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
    flow = InstalledAppFlow.from_client_secrets_file(
        'credentials.json', SCOPES)
    creds = flow.run_local_server(port=0)

    drive_service = build('drive', 'v3', credentials=creds)

    # Find the file
    results = drive_service.files().list(
        q=f"name='{file_name}' and mimeType='text/csv'",
        spaces='drive',
        fields='files(id, name)').execute()

    items = results.get('files', [])

    # Read the file
    if not items:
        print("File not found")
    else:
        file_id = items[0]['id']
        request = drive_service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            print(f"Download {int(status.progress() * 100)}%.")
        
        # Read CSV
        fh.seek(0)
        paper_data = pd.read_csv(fh)

    paper_data = paper_data.set_index('time')
    paper_data['Time'] = paper_data.index.astype(int)
    paper_data['Avg_Chloro'] #= paper_data['Avg_Chloro'].apply(np.log1p) #LOG AMPUTATION
    #IMPUTE HAB DATA
    # Build basic linear regression model as sanity check
    # Custom impute missing values with the average of the value in front and behind of it 
    class ForwardBackwardImputer(BaseEstimator, TransformerMixin):
        def __init__(self):
            pass

        def fit(self, X, y=None):
            return self

        def transform(self, X):
            X_filled_forward = X.fillna(method='ffill').fillna(method='bfill')
            X_filled_backward = X.fillna(method='bfill').fillna(method='ffill')

            return (X_filled_forward + X_filled_backward) / 2

    Imputer = ForwardBackwardImputer()
    paper_data = paper_data.apply(pd.to_numeric, errors='coerce')
    Imputer.fit(paper_data)
    paper_data = Imputer.transform(paper_data)#COMMENT OUT IF DONT WANT MEAN IMPUTE
    return paper_data

'''
Parse parameters from a CSV file and convert specific columns to lists.
Args:
    path (str): Path to the CSV file.
Returns:
    pd.DataFrame: DataFrame with parsed parameters.
'''
def process_parameters(path):
    parameters = pd.read_csv(path) 
    parameters['pred'] = parameters['pred'].apply(str_to_list)
    parameters['columns'] = parameters['columns'].apply(ast.literal_eval)
    return parameters

'''
Convert a string representation of a list to an actual list.
Args:
    s (str): String representation of a list.
Returns:
    list: Converted list.
'''
def str_to_list(s):
    s = s.replace('nan', 'null')  # Replace 'nan' with 'null' for JSON compatibility
    lst = json.loads(s)  # Convert string to list
    lst = [np.nan if x is None else x for x in lst]  # Replace None with np.nan
    return lst

def main():
    parser = argparse.ArgumentParser(description="Read a YAML config file.")
    parser.add_argument("config", type=str, help="Path to the YAML config file")
    args = parser.parse_args()
    config = load_yaml(args.config)

    data = clean_data(config["file_name"])

if __name__ == "__main__":
  main()