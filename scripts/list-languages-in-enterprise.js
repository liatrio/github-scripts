const { listAllRepositoriesInOrganization } = require("../util/github");

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
        const orgAndRepo = [];
        let hasNextPage = true;
        // workaround to avoid code duplication on next line, allows null initial value which graphql requires
        // eslint-disable-next-line unicorn/no-null
        let endCursor = null;
        const languagesInEnterprise = {};

        while (hasNextPage) {
            const enterpriseInfo = await graphql(`
                query ListOrgs {
                  viewer {
                    login
                  }
                  enterprise(slug: "${argv.enterprise}") {
                    id
                    organizations(
                        first: 100
                        after: ${endCursor}
                      ) {
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

            hasNextPage = enterpriseInfo.enterprise.organizations.pageInfo.hasNextPage;
            endCursor = `"${enterpriseInfo.enterprise.organizations.pageInfo.endCursor}"`;

            const allOrgsInEnterprise = enterpriseInfo.enterprise.organizations.nodes.map((org) => org.url.slice(org.url.lastIndexOf("/") + 1));

            for (const org of allOrgsInEnterprise) {
                const repositories = await listAllRepositoriesInOrganization(octokit, org);
                for (const repo of repositories) {
                    orgAndRepo.push({
                        organization: org,
                        repository: repo.name,
                    });
                }
            }
        }

        let languages;

        for (const repository of orgAndRepo) {
            try {
                languages = await octokit.rest.repos.listLanguages({
                    owner: repository.organization,
                    repo: repository.repository,
                });
            } catch (error) {
                console.log(`Exception listing languages for [${repository.organization}/${repository.repository}]: [${error}]`);
            }

            const sumBytes = getTotalCodeSizeInBytes(languages.data);

            for (const language in languages.data) {
                const percent = Math.round((languages.data[language] / sumBytes) * 100);

                if (languagesInEnterprise[language] && percent >= argv.percent) {
                    languagesInEnterprise[language].count++;
                    languagesInEnterprise[language].repos.push(`${repository.organization}/${repository.repository}`);
                } else {
                    languagesInEnterprise[language] = {
                        count: 1,
                        repos: [`${repository.organization}/${repository.repository}`],
                    };
                }
            }
        }

        console.table(languagesInEnterprise);
    },
};
