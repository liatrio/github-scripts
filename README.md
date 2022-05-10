# github-scripts

This is a CLI that can be used to invoke a collection of helpful scripts for interacting with GitHub in various ways.

## Setup

1. Install NodeJS (NodeJS 16.15.0 is latest stable)
    * [NodeJS Download](https://nodejs.org/en/)
2. Clone this repository
3. Install dependencies via `npm install`
4. Create GitHub PAT
    * [Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
    * Set PAT as environment variable -  `export GITHUB_TOKEN={PAT}` (Mac/Linux)

## Usage

```bash
$ node cli.js --help
```

### List Languages In Organization

Given a GitHub Organization, list the languages used within each repository.

```bash
$ node cli.js list-languages-in-organization --help
```

Example:

```bash
$ node cli.js list-languages-in-organization -o OneGHEOrg
```

### Reassign Repository Roles

Given a GitHub Organization, find each collaborator in each repository with a specific role, and update this role to a new one.

```bash
$ node cli.js reassign-repository-roles --help
```

Example:

```bash
$ node cli.js reassign-repository-roles -o OneGHEOrg --old-role "write" --new-role "maintain"
```
