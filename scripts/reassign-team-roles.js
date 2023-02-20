const { listAllTeamsInOrganization, listAllReposForTeam } = require("../util/github");

module.exports = {
    description: "globally reassign permissions for all teams within an organization",
    options: {
        "organization": {
            alias: "o",
            demandOption: true,
            describe: "the GitHub organization containing the teams to reassign roles",
            type: "string",
        },
        "old-role": {
            demandOption: true,
            describe: "old role",
            type: "string",
        },
        "new-role": {
            demandOption: true,
            describe: "new role",
            type: "string",
        },
    },
    action: async (octokit, _graphql, argv) => {
        const oldRole = argv["old-role"];
        const newRole = argv["new-role"];

        const teams = await listAllTeamsInOrganization(octokit, argv.organization);

        for (const team of teams) {
            const repositories = await listAllReposForTeam(octokit, argv.organization, team.slug);
            reposUpdated = 0;

            console.log(`Checking team '${team.slug}' for repositories with role '${oldRole}'...`)

            for (const repo of repositories) {
                if (repo.role_name === oldRole) {
                    console.log(`Updating team '${team.slug}' for repository '${argv.organization}/${repo.name}' from role '${oldRole}' to '${newRole}'`);

                    await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
                        org: argv.organization,
                        team_slug: team.slug,
                        owner: argv.organization,
                        repo: repo.name,
                        permission: newRole,
                    });
                    reposUpdated++;
                }
            }
            if (reposUpdated > 0) {
                console.log(`Finished checking team '${team.slug}'. Updated ${reposUpdated} repositories with role '${oldRole}' to '${newRole}'.`);
            } else {
                console.log(`Finished checking team '${team.slug}'. No repositories with role '${oldRole}' found.`);
            }
        }
    },
};
