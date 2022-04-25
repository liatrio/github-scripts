# Getting Started with github-discovery

This is a collection of scripts for exploring GitHub teams, organizations, and enterprises

## Setup

* Install Python 3.x (Python 3.10 is the latest)
  * [Python Download](https://www.python.org/downloads/)
* Install PIP
  * [PIP Install Commands](https://pip.pypa.io/en/stable/installation/)
* Install PIP requirements 
  * ```pip3 install -r {path_to_file}/requirements.txt```
* Create GitHub PAT
  * [Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## Running the Discovery Scripts

The program must be invoked as follows (substitue python with python3 if you used HomeBrew or a similar tool to install python without setting the python alias)

```
python {path_to_file}/{file}.py
```

Optional ([click](https://click.palletsprojects.com/en/7.x/) will prompt you for inputs if not provided)

```
python {path_to_file}/{file}.py {--click_argument=arg_input}
```