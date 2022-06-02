const { bold } = require("kleur");
const parseDuration = require("parse-duration");

const { warn, success, info, list, confirm } = require("../util/log");
const { listAllRepositoriesInOrganization, listAllRepositoriesInOrganizationUpdatedAfterDate } = require("../util/github");

module.exports = {
    description: "enable secret scanning / push protection for GitHub repositories within an organization",
    options: {
        "organization": {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization containing the repositories to enable secret scanning for",
            type: "string",
        },
        "repository": {
            alias: "r",
            describe: "only enable secret scanning / push protection on the specified repositories. this flag can be set multiple times",
            type: "array",
        },
        "duration": {
            alias: "d",
            describe: "when specified, enable secret scanning / push protection for all repositories that have activity within the specified duration. (ex: 1w = one week)",
            type: "string",
            conflicts: "repository",
        },
        "enable-push-protection": {
            alias: "p",
            default: false,
            describe: "also enable push protection",
            type: "bool",
        },
    },
    action: async (octokit, argv) => {
        const enablePushProtection = argv["enable-push-protection"];
        let repositories;

        if (argv.duration) {
            const duration = parseDuration(argv.duration);

            if (!duration) {
                warn("Unable to parse given duration string");

                return;
            }

            const now = new Date();
            const then = new Date(Date.now() - duration);

            repositories = (
                await listAllRepositoriesInOrganizationUpdatedAfterDate(octokit, argv.organization, then)
            ).map((repository) => repository.name);

            if (repositories.length === 0) {
                warn("Unable to find any repositories that have been updated within the specified duration.");

                return;
            }

            info(`You'd like to enable secret scanning / push protection for all repositories that have been updated between today (${now.toLocaleDateString()}) and ${then.toLocaleDateString()}:`);
            list(repositories);
            console.log();

            const ok = await confirm();

            if (!ok) {
                return;
            }
        } else if (!argv.repository) {
            warn(bold(`Warning: Enabling secret scanning / push protection for all repositories in the ${argv.organization} organization could consume many license seats.`));
            console.log("   You can enable secret scanning / push protection on select repositories by using the -r flag, or specify a last pushed duration with the -d flag.\n");

            const ok = await confirm();

            if (!ok) {
                return;
            }

            repositories = (
                await listAllRepositoriesInOrganization(octokit, argv.organization)
            ).map((repository) => repository.name);
        } else {
            repositories = argv.repository;
        }

        for (const repository of repositories) {
            try {
                const securityAndAnalysisPayload = {
                    advanced_security: {
                        status: "enabled",
                    },
                    secret_scanning: {
                        status: "enabled",
                    },
                };

                if (enablePushProtection) {
                    securityAndAnalysisPayload.secret_scanning_push_protection = {
                        status: "enabled",
                    };
                }

                const { data } = await octokit.rest.repos.get({
                    owner: argv.organization,
                    repo: repository,
                });

                if (
                    !data.security_and_analysis ||
                    (data.private && data.security_and_analysis?.advanced_security?.status !== "enabled") || // advanced security is always enabled for public repos
                    data.security_and_analysis?.secret_scanning?.status !== "enabled" ||
                    (enablePushProtection && data.security_and_analysis?.secret_scanning_push_protection?.status !== "enabled")
                ) {
                    success(`Enabling GitHub Advanced Security features for repository ${argv.organization}/${repository}`);

                    if (!data.private) { // advanced security is always enabled for public repos
                        delete securityAndAnalysisPayload.advanced_security;
                    }

                    await octokit.rest.repos.update({
                        owner: argv.organization,
                        repo: repository,
                        security_and_analysis: securityAndAnalysisPayload,
                    });
                } else {
                    warn(`Repository ${argv.organization}/${repository} already has all requested GitHub Advanced Security features enabled.`);
                }
            } catch (error) {
                if (error.status === 404) {
                    warn(`Repository ${argv.organization}/${repository} not found, skipping`);
                } else {
                    throw error;
                }
            }
        }
    },
};
