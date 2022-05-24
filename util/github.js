const listAllRepositoriesInOrganization = async (octokit, organization) => {
    const repositories = await octokit
        .paginate(octokit.rest.repos.listForOrg, {
            org: organization,
            type: 'any',
            per_page: 100
        });

    return repositories.filter((repository) => !repository.archived);
};

const listAllRepositoriesInOrganizationUpdatedAfterDate = async (octokit, organization, date) => {
    const repositories = await octokit
        .paginate(octokit.rest.repos.listForOrg, {
            org: organization,
            type: 'any',
            per_page: 100
        });

    return repositories
        .filter((repository) => !repository.archived)
        .filter((repository) => {
            const lastPushedDate = new Date(repository.pushed_at)

            return lastPushedDate > date;
        });
};

const listAllCollaboratorsInRepository = (octokit, organization, repository) =>
    octokit.paginate(octokit.rest.repos.listCollaborators, {
        owner: organization,
        repo: repository,
        affiliation: "direct",
    });

module.exports = {
    listAllRepositoriesInOrganization,
    listAllRepositoriesInOrganizationUpdatedAfterDate,
    listAllCollaboratorsInRepository
};
