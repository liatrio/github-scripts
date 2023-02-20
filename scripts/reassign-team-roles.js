const { listAllTeamsInOrganization, listAllReposForTeam, listAllRolesInOrg } = require("../util/github");

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
        const roleNames = listAllRolesInOrg(octokit, argv.organization);
        const roleName = roleNames
        console.log(`All Custom Roles in Organization: ${roleName}`)
        for (const team of teams) {
            const repositories = await listAllReposForTeam(octokit, argv.organization, team.slug);
            console.log(`Team Name: ${team.slug}`)
            for (const repo of repositories) {
                if (repo.role_name === oldRole) {
                    console.log(`Updating team ${team.slug} for repository ${argv.organization}/${repo.name} from ${oldRole} to ${newRole}`);

                    await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
                        org: argv.organization,
                        team_slug: team.slug,
                        owner: argv.organization,
                        repo: repo.name,
                        permission: newRole,
                    });
                }
            }
        }
    },
};
