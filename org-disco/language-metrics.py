import click
import sys
from github import Github


def checkKey(dict, language):
    if language in dict.keys():
        dict[language] += 1
    else:
        dict[language] = 1
    return dict


@click.command
@click.option('--gh_pat', prompt="Enter your GitHub PAT")
def main(gh_pat):
    g = Github(gh_pat)
    language_dict = {}
    for repo in g.get_user().get_repos():
        language_dict = checkKey(language_dict, repo.language)

    print(language_dict)


if __name__ == "__main__":
    sys.exit(main())
