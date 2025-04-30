


# Imports + Environment
### Create env in conda prompt:
```conda create -n gcp-env python=3.9 -y```
### In bash:
```source ~/anaconda3/etc/profile.d/conda.sh ```
```conda activate gcp-env

### Install Dependencies(Make sure in root):
```conda env update --name gcp-env --file environment.yml```


## Backend
### Local Setup:
run ```python3 forecast.py configs/baseline.yaml```
#### Directory
app/
├── forecast.py
├── 100_sample_baseline_models.csv
├── baseline.yaml          # (if meant to be in root, otherwise remove)
├── configs/
│   └── baseline.yaml


### Setup for Remote Database
``` To be implemented ```

