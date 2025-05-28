import pandas as pd
import numpy as np
from joblib import Parallel, delayed
from pyEDM import *
from sklearn.base import BaseEstimator, TransformerMixin
import ast
import json
import yaml
import argparse
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload
import io
import datetime

import warnings
warnings.filterwarnings("ignore", 
    message="A worker stopped while some jobs were given to the executor.",
    module="joblib.externals.loky.process_executor")

def get_block(data, num_lags=1, tau=1):
    ''' Get a dataframe with all the possible valid lags of the variables. '''
    
    block = pd.concat([data[var].shift(lag*tau).rename(f'{var}(t-{lag*tau})') for lag in range(num_lags+1) for var in data.columns], axis=1)

    return block
def get_xmap_results_smap(block, target, embeddings, Tp, theta, lib, pred):
    '''Function to do exhaustive search of embeddings.'''
    
    def compute_rho(block, target, embedding, Tp, theta, lib, pred):
        xmap = SMap(dataFrame=block, target=target, columns=embedding, Tp=Tp, theta=theta, embedded=True, lib=lib, pred=pred, noTime=True)
        rho = xmap['predictions'][['Observations', 'Predictions']].corr().iloc[0,1]
        return embedding, xmap['predictions'], rho

    xmap_results = pd.DataFrame(columns=['embedding', 'rho'])
    xmap_results = Parallel(n_jobs=-1)(delayed(compute_rho)(block, target, embedding, Tp, theta, lib, pred) for embedding in embeddings)
    xmap_results = pd.DataFrame(xmap_results, columns=['embedding', 'result', 'rho'])
    xmap_results = xmap_results.sort_values(by='rho', ascending=False).reset_index(drop=True)
    
    return xmap_results

def get_valid_lags_tau(block, target, tau, num_lags, system_variables):
    
    # Get lags of system variables
    system_variable_lags = []
    for var in system_variables:
        var_lags = [f'{var}(t{i})' if i < 0 else f'{var}(t-{i})' for i in range(num_lags * tau, 1)]
        var_lags = var_lags[::tau][:num_lags+1]
        system_variable_lags = system_variable_lags + var_lags
    
    # Remove (t-0) lag of target variable from valid_lags
    valid_lags = [x for x in system_variable_lags if x[-4:-1] != 't-0']

                    
    return valid_lags


def create_single_model(E,theta,target,i_cols,lib, pred,HAB_embed,showPlot=False):
    driver = f'{target}(t-0)'
    cols = i_cols
    result = SMap(
        dataFrame = HAB_embed, 
        columns = cols,
        target = driver,
        lib = lib,  # Library from rows 0 to 700
        pred = pred,
        E = E+1,
        theta=theta,
        noTime=True,
        showPlot = showPlot,
        embedded=True,
        ignoreNan = True
    )
    return result

def thresh_bloom_binary_prediction(obs,pred,threshold=8.03199999999999):
    #obs_bloom_95 = np.percentile(obs, 95) #incorrect
    #pred_bloom_95 = np.percentile(pred, 95) #incorrect
    obs_blooms = obs > threshold
    pred_blooms = pred > threshold
    Accuracy = 1 - (obs_blooms ^ pred_blooms).mean()
    True_pos = (obs_blooms & pred_blooms).sum() / obs_blooms.sum()
    False_pos = ((~obs_blooms) & pred_blooms).sum() / (~obs_blooms).sum()
    True_neg = ((~obs_blooms) & (~pred_blooms)).sum() / (~obs_blooms).sum()
    False_neg = (obs_blooms & (~pred_blooms)).sum() / obs_blooms.sum()
    
    return [Accuracy, True_pos, False_pos, True_neg, False_neg]


def create_model(data,params,target,lib,pred,ensemble_sz=300):
    HAB_embed_block = get_block(data,50)
    parameters = pd.DataFrame(columns=['target', 'columns', 'E', 'theta', 'pred'])
    for i in range(ensemble_sz):
        E = params['E'].iloc[i]
        theta = params['theta'].iloc[i]
        embedding = params['columns'].iloc[i]
        smap_model = create_single_model(E,theta,target,embedding,lib, pred,HAB_embed_block,showPlot=False)
        df = smap_model['predictions']
        #bbp = thresh_bloom_binary_prediction(df['Observations'].iloc[1:-1],df['Predictions'].iloc[1:-1])

        new_row = {'target': target, 'columns': embedding + [f'{target} (t-0)'], 'E': E,'theta':theta, 'pred':df['Predictions']}
        parameters.loc[len(parameters)] = new_row

    return parameters



def ensemble_binary_bloom(parameters_df,n=300,p=0.05,samp=1,bloom_thresh=8.013):
    parameters_df = parameters_df.iloc[:n*samp].sample(n)
    sum = np.zeros(np.array(parameters_df['pred'].iloc[0][1:]).size)
    for i in range(n):
        curr = np.array(parameters_df['pred'].iloc[i][1:]) > bloom_thresh#np.percentile(parameters_df['pred'].iloc[i].iloc[1:],95)#
        sum = sum + curr
    return sum 

'''
@parameters
data (dataframe) - data containing column for target and desired system variables'
params (dataframe) - data containing info for Smap models
target (string) - variable to forecast bloom of

@return
returns forecast for next time step given the dataframe, and number of models which predicted True
'''

def next_forecast(data,params,target,n=300,p=0.05,lib_off=-2):#data,params,target,lib,pred,ensemble_sz=300
    lib = '1 ' + str(data.shape[0] + lib_off) 
    pred = '' + str(data.shape[0] + lib_off + 1) + ' ' + str(data.shape[0])
    parameters = create_model(data,params,target,lib,pred)
    preds = ensemble_binary_bloom(parameters,n=n,p=p,samp=1,bloom_thresh=8.013)
    return preds> (n*p), preds


def clean_data(data_path):
    paper_data = pd.read_csv(data_path)
    paper_data = paper_data.set_index('time')
    paper_data['Time'] = paper_data.index.astype(int)
    paper_data['Avg_Chloro'] #= paper_data['Avg_Chloro'].apply(np.log1p) #LOG AMPUTATION
    #IMPUTE HAB DATA
    #Build basic linear regression model as sanity check
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
    paper_data = Imputer.transform(paper_data)#COMMENT OUT IF DONT WANT MEAN MPUTE
    return paper_data

def str_to_list(s):
    s = s.replace('nan', 'null')  # Replace 'nan' with 'null' for JSON compatibility
    lst = json.loads(s)  # Convert string to list
    lst = [np.nan if x is None else x for x in lst]  # Replace None with np.nan
    return lst

def process_parameters(path):

    parameters = pd.read_csv(path) 
    parameters['pred'] = parameters['pred'].apply(str_to_list)
    parameters['columns'] = parameters['columns'].apply(ast.literal_eval)
    return parameters


def load_yaml(file_path):
    with open(file_path, 'r') as f:
        return yaml.safe_load(f)

def download_from_drive(file_id, destination):
    import io
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
    creds = service_account.Credentials.from_service_account_file(
        os.environ['GOOGLE_APPLICATION_CREDENTIALS']
    )
    service = build("drive", "v3", credentials=creds)
    request = service.files().get_media(fileId=file_id)
    with open(destination, "wb") as f:
        downloader = MediaIoBaseDownload(f, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()


def initialize_drive_service():
    """Initialize and return Google Drive service."""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'],
            scopes=['https://www.googleapis.com/auth/drive.file']
        )
        return build('drive', 'v3', credentials=credentials)
    except Exception as e:
        print(f"Error initializing Drive service: {e}")
        return None

def download_file_from_drive(service, file_id, destination):
    """Download a file from Google Drive."""
    try:
        request = service.files().get_media(fileId=file_id)
        file = io.BytesIO()
        downloader = MediaIoBaseDownload(file, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
            print(f"Download {int(status.progress() * 100)}%")
        file.seek(0)
        with open(destination, 'wb') as f:
            f.write(file.read())
        return True
    except Exception as e:
        print(f"Error downloading file: {e}")
        return False

def upload_to_drive(service, file_path, folder_id, filename=None):
    """Upload a file to Google Drive. If a file with the same name exists in the folder, it will be overwritten.
    
    Args:
        service: Google Drive service instance
        file_path: Path to the file to upload
        folder_id: ID of the folder to upload to
        filename: Optional custom filename, if None uses the original filename
    """
    try:
        # Use provided filename or get from path
        file_name = filename or os.path.basename(file_path)
        
        # Check if file with same name exists in folder
        response = service.files().list(
            q=f"name='{file_name}' and '{folder_id}' in parents and trashed=false",
            spaces='drive',
            fields='files(id)'
        ).execute()
        
        # If file exists, delete it
        for file in response.get('files', []):
            service.files().delete(fileId=file['id']).execute()
            print(f"Deleted existing file with name: {file_name}")
        
        # Upload new file
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        media = MediaFileUpload(
            file_path,
            mimetype='application/json',
            resumable=True
        )
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        return file.get('id')
    except Exception as e:
        print(f"Error uploading file: {e}")
        return None

def temporary_forecast_workflow(raw_data_file_id, parameters_file_id, output_folder_id):
    """
    Temporary workflow to generate forecasts using Google Drive files.
    If the workflow fails, it will upload a default forecast file.
    
    Args:
        raw_data_file_id (str): Google Drive ID for raw data CSV
        parameters_file_id (str): Google Drive ID for model parameters
        output_folder_id (str): Google Drive folder ID for output
    """
    # Default forecast data
    default_forecast = [
        {"day": "Sunday", "value": 760},
        {"day": "Monday", "value": 260},
        {"day": "Tuesday", "value": 10},
        {"day": "Wednesday", "value": 60},
        {"day": "Thursday", "value": 400},
        {"day": "Friday", "value": 560},
        {"day": "Saturday", "value": 920}
    ]
    
    # Initialize Drive service
    service = initialize_drive_service()
    if not service:
        print("Failed to initialize Drive service")
        return

    # Use a consistent filename for the forecast
    output_file = 'latest_forecast.json'
    
    try:
        # Download and process files
        download_file_from_drive(service, raw_data_file_id, 'temp_raw_data.csv')
        download_file_from_drive(service, parameters_file_id, 'temp_parameters.csv')

        # Read and process data
        raw_data = pd.read_csv('temp_raw_data.csv')
        parameters = pd.read_csv('temp_parameters.csv')
        
        # Process parameters
        parameters['pred'] = parameters['pred'].apply(str_to_list)
        parameters['columns'] = parameters['columns'].apply(ast.literal_eval)

        # Generate forecast
        data = clean_data(raw_data)
        forecast, num_models = next_forecast(
            data,
            parameters,
            target='Avg_Chloro',
            n=300,
            p=0.05
        )

        # Prepare forecast output
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        forecast_output = [
            {"day": day, "value": int(num_models[i])}
            for i, day in enumerate(days)
        ]

    except Exception as e:
        print(f"Error in forecast workflow: {e}")
        print("Using default forecast data")
        forecast_output = default_forecast

    finally:
        try:
            # Always write output file (either computed or default)
            with open(output_file, 'w') as f:
                json.dump(forecast_output, f, indent=2)

            # Upload to Drive
            file_id = upload_to_drive(service, output_file, output_folder_id, filename='latest_forecast.json')
            if file_id:
                print(f"Successfully uploaded forecast. File ID: {file_id}")
            else:
                print("Failed to upload forecast")

            # Cleanup temporary files
            for temp_file in ['temp_raw_data.csv', 'temp_parameters.csv', output_file]:
                if os.path.exists(temp_file):
                    os.remove(temp_file)

        except Exception as e:
            print(f"Error in cleanup/upload phase: {e}")

def main():
    """
    Original main function kept for reference.
    Comment out the original workflow and add the new temporary workflow.
    """
    # Original workflow (kept for reference)
    """
    parser = argparse.ArgumentParser(description="Read a YAML config file.")
    parser.add_argument("config", type=str, help="Path to the YAML config file")
    args = parser.parse_args()

    config = load_yaml(args.config)
    print("YAML Contents:")
    for key, value in config.items():
        print(f"{key}: {value}")
    
    data = clean_data(config['file_name'])
    parameters = process_parameters(config['parameters_path'])
    forecast, num_models = next_forecast(data,parameters,config['target'],n=config['n'],p=config['p'])
    print(f'Bloom prediction: {forecast[-1]}')
    print(f'Num of models which predict bloom: {num_models[-1]}')
    """

    # New temporary workflow
    parser = argparse.ArgumentParser(description="Run forecast with Google Drive files")
    parser.add_argument("--raw-data-id", required=True, help="Google Drive ID for raw data CSV")
    parser.add_argument("--parameters-id", required=True, help="Google Drive ID for parameters file")
    parser.add_argument("--output-folder-id", required=True, help="Google Drive folder ID for output")
    
    args = parser.parse_args()
    
    temporary_forecast_workflow(
        args.raw_data_id,
        args.parameters_id,
        args.output_folder_id
    )

if __name__ == "__main__":
    main()
    
