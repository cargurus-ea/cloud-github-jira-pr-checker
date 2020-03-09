/* eslint-disable no-undef */
// load required modules
const utilities = require("../services/utilities");

// initialize testing consts
const issue = "PROJ-1234";
const issueDescription = "Test Issue Description";
const releaseState = "Ready to Release";
const pullRequestName = `[${issue}] Test PR`;
const projectPattern = "[A-Za-z]*-\\d\\d*";
const config = {
    jira_url: "test.atlassian.net",
    jira_auth: "####ABC123####",
    jira_release_state: releaseState,
    project_pattern: new RegExp(projectPattern), // get pattern string and immediately convert to regex
    sox_check: false,
};
const issueObject = {
    name: issue,
    fields: {
        summary: issueDescription,
        status: {
            name: releaseState,
        },
    },
};
const context = {
    payload: {
        pull_request: {
            title: pullRequestName,
        },
    },
};

test("checks for config object", () => {
    expect(utilities.getConfig(config)).toStrictEqual(config);
});

test("checks if issue summary can be retrieved", () => {
    expect(utilities.retrieveIssueSummary(issueObject)).toBe(issueDescription);
});

test("checks if issue status can be retrieved", () => {
    expect(utilities.retrieveIssueStatus(issueObject)).toBe(releaseState);
});

test("checks if pull request name can be retrieved", () => {
    expect(utilities.getPullRequestName(context)).toBe(
        context.payload.pull_request.title,
    );
});

test("checks if pull request name can be successfully scanned", () => {
    expect(utilities.scanPullRequestName(pullRequestName, config)).toBe(issue);
});
