const { exit } = require("yargs");
const { listAllRepositoriesInOrganization } = require("../util/github");

const { error, warn, success, info, list } = require("../util/log");
const getTotalCodeSizeInBytes = (obj) => Object.values(obj).reduce((accumulator, value) => accumulator + value, 0);

module.exports = {
    description: "list language usage within an enterprise",
    options: {
        enterprise: {
            alias: "e",
            demandOption: true,
            describe: "the GitHub enterprise to search for language usage",
            type: "string",
        },
        percent: {
            alias: "p",
            default: 25,
            describe: "what percentage of code is needed to qualify as a \"used\" language",
            type: "number",
        },
    },
    action: async (octokit, graphql, argv) => {
        let organdrepo = [];
        const languagesInEnterprise = {};

        const enterpriseInfo = await graphql(`
          query ListOrgs {
            viewer {
              login
            }
            enterprise(slug: "${argv.enterprise}") {
              id
              organizations(first: 100) {
                nodes {
                  url
                }
                pageInfo {
                  startCursor
                  hasPreviousPage
                  hasNextPage
                  endCursor
                }
              }
              slug
              name
            }
          }
        `);

        const allOrgsInEnterprise = enterpriseInfo.enterprise.organizations.nodes.map((org) => org.url.slice(org.url.lastIndexOf("/") + 1));

        for (const org of allOrgsInEnterprise) {
            const repositories = await listAllRepositoriesInOrganization(octokit, org);
            for (const repo of repositories) {
                organdrepo.push({
                    organization: org,
                    repository: repo.name,
                })
            }
        }

        // for (const thing in organdrepo) {
        //   console.log(thing);
        // }
        console.log(organdrepo);
        exit();

        //const repositories = await listAllRepositoriesInEnterprise(octokit, argv.organization);

        for (const repository of repositories) {
            const languages = await octokit.rest.repos.listLanguages({
                owner: argv.organization,
                repo: repository.name,
            });

            const sumBytes = getTotalCodeSizeInBytes(languages.data);

            for (const language in languages.data) {
                const percent = Math.round((languages.data[language] / sumBytes) * 100);

                if (languagesInOrg[language] && percent >= argv.percent) {
                    languagesInOrg[language].count++;
                    languagesInOrg[language].repos.push(repository.name);
                } else {
                    languagesInOrg[language] = {
                        count: 1,
                        repos: [repository.name],
                    };
                }
            }
        }

        console.table(languagesInOrg);
    },
};