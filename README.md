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

There are two global options for every command:
- `-t, --token` is used to specify the personal access token that the CLI will use for authentication. You can also set
  this with the `GITHUB_TOKEN` environment variable.
- `-u, --api-url` is used to specify the base API url, which can be set in order to work with GitHub Enterprise Server.
  This defaults to the base API url of github.com. You can also set this with the `GITHUB_API_URL` environment variable.

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

### Reassign Team Roles 
Given a GitHub Organization, find each team with a specific role in any repository, and update this role to a new one.

```bash
$ node cli.js reassign-team-roles --help
```

Example:

```bash
$ node cli.js reassign-team-roles -o OneGHEOrg --old-role "write" --new-role "maintain"
```

### Enable GitHub Advanced Security Features (Secret Scanning / Push Protection)

Given a GitHub Organization and (optionally) a list of repositories, enable GitHub Advanced Security features within each repository.

```bash
$ node cli.js enable-secret-scanning --help
```

Example - enable secret scanning and push protection only on the `OneGHEOrg/github-azure-demo` repository:

```bash
$ node cli.js enable-secret-scanning -o OneGHEOrg -r github-azure-demo -p true
```

Example - enable secret scanning on all repositories within the `OneGHEOrg` organization that have been updated within the last month:

```bash
$ node cli.js enable-secret-scanning -o OneGHEOrg -d "1 month"
```

### List Repos With File Extensions

Given a GitHub Organization, find each repository containing specific file extensions, number of occurrences, and total files in repo

```bash
$ node cli.js list-repos-with-file-extensions --help
```

Example:

```bash
$ node cli.js list-repos-with-file-extensions -o OneGHEOrg -e jar -e war
```
