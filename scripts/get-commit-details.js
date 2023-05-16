const { listAllRepositoriesInOrganization } = require("../util/github");

let totalCommits = 0;

module.exports = {
    description: "list commits for repositories in an organization",
    options: {
        organization: {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization to search for language usage",
            type: "string",
        },
        history_in_days: {
            alias: "d",
            demandOption: false,
            describe: "the number of days to search for commits",
            type: "number",
            default: 30,
        },
    },
    action: async (octokit, _graphql, argv) => {
        const repositories = await listAllRepositoriesInOrganization(octokit, argv.organization);

        for (const repository of repositories) {
            const repoInfo = await octokit.rest.repos.get({
                owner: argv.organization,
                repo: repository.name,
            });

            // ISO 8601 timestamp for now
            const now = new Date();
            const nowIso = now.toISOString();

            // ISO 8601 timestamp for x number of days ago
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - argv.history_in_days));
            const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

            const enterpriseInfo = await _graphql(`
              {
                repository(owner: "${argv.organization}", name: "${repository.name}") {
                  object(expression: "${repoInfo.data.default_branch}") {
                    ... on Commit {
                      history(since: "${thirtyDaysAgoIso}", until: "${nowIso}") {
                        totalCount
                      }
                    }
                  }
                }
              }
            `);

            // if total commits is not null, add it to the total
            try {
                totalCommits += enterpriseInfo.repository.object.history.totalCount;
                console.log(`Total commits for ${repository.name} in last ${argv.history_in_days} days: ${enterpriseInfo.repository.object.history.totalCount}`);
            } catch {
                console.log(`No commits for ${repository.name}`);
            }
        }

        console.log(`Total commits in last ${argv.history_in_days} days for ${argv.organization} organization: ${totalCommits}`);
    },
};
