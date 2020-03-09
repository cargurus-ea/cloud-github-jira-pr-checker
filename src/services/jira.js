/* eslint-disable no-console */

/*
 * Required Imports
 */

const jiraClient = require("jira-connector");
const utilities = require("./utilities");

/**
 * Initializes jira client connection and returns.
 *
 * @param {string} url Jira instance url
 * @param {string} auth Jira auth string
 * @return {interface} jira client
 */

function createJiraConnection(
    url,
    consumerKey,
    privateKey,
    accessToken,
    requestSecret,
) {
    const formattedPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;

    // Initialize jira connection
    // eslint-disable-next-line new-cap
    return new jiraClient({
        host: url,
        oauth: {
            consumer_key: consumerKey,
            private_key: formattedPrivateKey,
            token: accessToken,
            token_secret: requestSecret,
        },
    });
}

/**
 * Function which retrieves issues specified from jira.
 *
 * @param {string} issue issue number in form PROJ-123
 * @return {promise} resolves into the retrieved issue at the calling function
 */

function retrieveIssue(
    issue,
    jiraUrl,
    consumerKey,
    privateKey,
    accessToken,
    requestSecret,
) {
    let jira;
    try {
        jira = createJiraConnection(
            jiraUrl,
            consumerKey,
            privateKey,
            accessToken,
            requestSecret,
        );
    } catch (error) {
        throw new Error(error); // error connecting to Jira
    }

    return new Promise(function execute(resolve, reject) {
        try {
            resolve(
                jira.issue.getIssue({
                    issueKey: issue,
                }),
            );
        } catch (error) {
            reject(error); // error after connecting to jira
        }
    });
}

exports.retrieveIssue = retrieveIssue;
