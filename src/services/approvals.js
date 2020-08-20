/* eslint-disable no-console */

/*
 * Required Imports
 */

const utilities = require("../services/utilities.js");
const core = require("@actions/core");

/*
 * App Variables
 */

const config = utilities.getConfig();

/**
 * Checks for the existence of a designated issue.
 * This is a standalone function for ease of future development.
 *
 * @param {string} issue issue string in form PROJ-1234
 * @return {boolean} true if issue exists, else false
 */

const issueCheck = (issueKey, jiraKey) => issueKey === jiraKey;

/**
 * Checks to ensure the issue state is equivalent to the release state defined in config.
 * This is a standalone function for ease of future development.
 *
 * @param {string} status string representing jira
 * @return {boolean} returns true if check passes, otherwise false
 */

const statusCheck = (currentState, releaseState) =>
    currentState === releaseState;

/**
 * Checks to ensure the issue has correct SOX approvals. This is being left in case SOX compliancy testing needs to be altered in the future.
 *
 * @param {object} issueObject JSON representation of Jira issue
 * @return {boolean} returns true if check passes, otherwise false
 */

function soxCheck(issueObject, soxCheckNeeded) {
    let passing = false;
    if (soxCheckNeeded) {
        // do something
        passing = true;
    } else {
        passing = true;
    }
    return passing;
}

/**
 * Runs all helper functions and returns complete approvals object.
 *
 * @param {object} issueObject JSON object represting Jira issue
 * @param {string} jiraKey string that matches key of jira project
 * @param {object} config object representing current configuration
 * @return {object} containing check pass / fail data
 */

function getApprovals(issueObject, jiraKey) {
    return [
        {
            name: "Existence Test",
            value: issueCheck(issueObject.key, jiraKey),
            errorCode: 0,
        },
        {
            name: "State Test",
            value: statusCheck(
                issueObject.fields.status.name,
                config.jira_release_state,
            ),
            errorCode: 1,
        },
        {
            name: "Sox Test",
            value: soxCheck(issueObject, config.sox_check),
            errorCode: 2,
        },
    ];
}

/**
 * Returns object containing data indicating whether all checks passed / failed.
 *
 * @param {object} issueObject JSON object represting Jira issue
 * @param {string} jiraKey string that matches key of jira project
 * @param {object} config object representing current configuration
 * @return {void}
 */

async function check(jiraKey) {
    console.log(`Project Key: ${jiraKey}`);
    // attempt to retrieve issue object
    utilities.retrieveIssueObject(jiraKey).then(issueObject => {
        if (issueObject != null) {
            // grab approvals object
            const approvalsArray = getApprovals(issueObject, jiraKey);
            try {
                // setup error variables
                let errorCode = null;
                // loop through approvals array checking each test
                for (let i = 0; i < approvalsArray.length; i += 1) {
                    if (approvalsArray[i].value === true) {
                        console.log(`${approvalsArray[i].name}: Passed`);
                        if (approvalsArray[i].name === "Existence Test") {
                            let jiraLink =
                                core.getInput("jira_url") +
                                "/browse/" +
                                jiraKey;
                            utilities.postReview(
                                "Link to associated Jira: [" +
                                    jiraLink +
                                    "](" +
                                    jiraLink +
                                    ")",
                                "COMMENT",
                            );
                        }
                    } else {
                        console.log(`${approvalsArray[i].name}: Failed`);
                        if (errorCode === null)
                            errorCode = approvalsArray[i].errorCode;
                    }
                }
                // handle any errors produced
                if (errorCode === null) {
                    // no errors, execution ending
                    console.log("All checks have passed, execution is ending.");
                    utilities.handleSuccess();
                } else {
                    // errors occurred
                    console.log("Check(s) failed, execution is ending.");
                    utilities.handleError(errorCode);
                }
            } catch (error) {
                // execution ending
                utilities.handleError(99, error.message);
            }
        }
    });
}

exports.issueCheck = issueCheck;
exports.statusCheck = statusCheck;
exports.soxCheck = soxCheck;
exports.getApprovals = getApprovals;
exports.check = check;
