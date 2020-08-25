/* eslint-disable no-console */

/*
 * Required Imports
 */

const core = require("@actions/core");
const github = require("@actions/github");
const jira = require("./jira.js");

/*
 * App Variables
 */

const context = github.context;

// load config object
const config = {
    jira_url: core.getInput("jira_url"),
    jira_auth: core.getInput("jira_auth"),
    jira_release_state: core.getInput("jira_release_state"),
    project_pattern: new RegExp(core.getInput("project_pattern")), // get pattern string and immediately convert to regex
    sox_check: core.getInput("sox_check"),
};

// holds error messages
const errorMessages = [
    "An existing Jira issue could not be found with the given project key.",
    "A Jira issue has been found, however it is not in the correct state for release.",
    "A Jira issue has been found, however it does not meet approval requirements for SOX compliancy.",
    "No valid project key found in PR title.",
    "Error connecting to Jira, please ensure that all authentication details are correct.",
];

/**
 * Returns config object loaded globally.
 *
 * @param {object} testConfig JSON representation of config, mainly for testing
 * @return {object} configuration option values
 */

const getConfig = testConfig => (!testConfig ? config : testConfig);

/**
 * Retrieves the summary of a retrieve Jira issue.
 *
 * @param {object} retrievedIssue JSON representation of queried Jira issue
 * @return {string} issue summary
 */

const retrieveIssueSummary = retrievedIssue => retrievedIssue.fields.summary;

/**
 * Retrieve the status of a queried Jira issue.
 *
 * @param {object} retrievedIssue JSON representation of queried Jira issue
 * @return {string} issue status
 */

const retrieveIssueStatus = retrievedIssue => retrievedIssue.fields.status.name;

/**
 * Retrieves the name of the pull request in context.
 *
 * @param {object} testContext JSON representation of context of PR request for testing
 * @return {string} name of pull request
 */

const getPullRequestName = testContext =>
    !testContext
        ? context.payload.pull_request.title
        : testContext.payload.pull_request.title;

/**
 * Posts a comment to the pull request currently in context.
 *
 * @param {string} message text which will be used as body of comment
 * @return {void}
 */

function postReview(message, reviewEvent) {
    try {
        const githubToken = core.getInput("github_token");
        const octokit = new github.GitHub(githubToken);
        const pullRequest = context.payload.pull_request;
        if (octokit) {
            octokit.pulls.createReview({
                ...context.repo,
                pull_number: pullRequest.number,
                body: message,
                event: reviewEvent,
            });
        }
    } catch (error) {
        // core.setFailed(error.message);
    }
}

/**
 * Posts error comment and sets check to failed before throwing error.
 *
 * @param {integer} errorNum corresponds to element in errorMessages array
 * @return {void}
 */

function handleError(errorNum, errorMessage) {
    if (errorMessage == null) {
        postReview(errorMessages[errorNum], "REQUEST_CHANGES");
        // core.setFailed(errorMessages[errorNum]);
    } else if (errorMessage != null) {
        postReview(errorMessage, "REQUEST_CHANGES");
        // core.setFailed(errorMessage);
    }

    // throw errorNum;
}

/**
 * Sets designated output action ith designated message.
 *
 * @param {integer} outputNum corresponds to element in output array
 * @param {integer} successNum corresponds to element in successMessages array
 * @return {void}
 */

function handleSuccess() {
    postReview("All Jira Checks Have Passed", "APPROVE");
}

/**
 * Scans pull request name to check for project.
 *
 * @param {string} pullRequestName name of pull request
 * @param {regex} projectPattern a regEx pattern for matching, mainly for testing
 * @return {array} array of matches found, otherwise null
 */

function scanPullRequestName(pullRequestName, testConfig) {
    // if a testConfig is passed use that, else use default config
    const projectKey = testConfig
        ? testConfig.project_pattern.exec(pullRequestName)
        : config.project_pattern.exec(pullRequestName);

    // if some data is found, return it
    if (projectKey != null && projectKey.length > 0) {
        return projectKey[0];
    }
    // if no data is found, return null
    return null;
}

/**
 * Returns project key scanned from Pull Request Name;
 *
 * @return {array} array of matches found otherwise null
 */

const getProjectKey = () => scanPullRequestName(getPullRequestName());

/**
 * Retrieves JIRA issue and returns as JSON object
 *
 * @param {string} issue represents project key of issue to be searched
 * @return {object} JSON representation of queried Jira issue
 */

async function retrieveIssueObject(issue) {
    let issueObject = null;
    try {
        issueObject = await jira.retrieveIssue(
            issue,
            core.getInput("jira_url"),
            core.getInput("jira_consumer_key"),
            core.getInput("jira_private_key"),
            core.getInput("jira_access_token"),
            core.getInput("jira_token_secret"),
        );
        return issueObject;
    } catch (error) {
        const errorObject = JSON.parse(error);
        if (errorObject.statusCode !== 404) {
            const errorMessage = errorObject.body.replace(/(\r\n|\n|\r)/gm, "");
            handleError(1000, `Jira Error: ${errorMessage}`);
        } else {
            // return an errored issue object for graceful handling
            issueObject = {
                key: "error",
                fields: {
                    status: {
                        name: "error",
                    },
                },
            };
        }
        return issueObject;
    }
}

exports.getConfig = getConfig;
exports.handleError = handleError;
exports.handleSuccess = handleSuccess;
exports.retrieveIssueSummary = retrieveIssueSummary;
exports.retrieveIssueStatus = retrieveIssueStatus;
exports.getPullRequestName = getPullRequestName;
exports.scanPullRequestName = scanPullRequestName;
exports.getProjectKey = getProjectKey;
exports.retrieveIssueObject = retrieveIssueObject;
exports.postReview = postReview;
