const yargs = require("yargs/yargs");
const { Octokit } = require("@octokit/rest");
let { graphql } = require("@octokit/graphql");
const { RequestError } = require("@octokit/request-error");
const { hideBin } = require("yargs/helpers");
const fs = require("node:fs/promises");
const path = require("node:path");

const { GITHUB_API_URL } = require("./util/constants");

(async () => {
    const scriptsDir = path.join(__dirname, "scripts");
    const files = await fs.readdir(scriptsDir);

    let argv = yargs(hideBin(process.argv))
        .option("token", {
            alias: "t",
            describe: "GitHub personal access token to use when making API calls",
            demandOption: true,
        })
        .option("api-url", {
            alias: "u",
            describe: "When using with GitHub Enterprise Server, set this to the root URL of the API. Example: https://github.my-domain.com/api/v3",
        })
        .default("token", () => process.env.GITHUB_TOKEN, "GITHUB_TOKEN environment variable")
        .default("api-url", () => process.env.GITHUB_API_URL || GITHUB_API_URL, `GITHUB_API_URL environment variable, or ${GITHUB_API_URL} if not specified`);

    const actions = {};

    for (const file of files) {
        const { description, options, action } = require(path.join(scriptsDir, file));
        const { name } = path.parse(file);

        actions[name] = action;

        argv = argv.command(name, description, options);
    }

    argv = argv
        .wrap(null) // eslint-disable-line unicorn/no-null
        .help()
        .demandCommand()
        .strict()
        .argv;

    const octokit = new Octokit({
        auth: argv.token,
        baseUrl: argv["api-url"],
    });

    let graphqlEndPoint = "";
    if (!argv["api-url"].includes("api.github.com")) {
        graphqlEndPoint = argv["api-url"].slice(0, argv["api-url"].lastIndexOf("/"));
    } else {
        graphqlEndPoint = argv["api-url"];
    }

    graphql = graphql.defaults({
        baseUrl: graphqlEndPoint,
        headers: {
            authorization: `token ${argv.token}`,
        },
    });

    console.log();

    await actions[argv._[0]](octokit, graphql, argv);
})();
