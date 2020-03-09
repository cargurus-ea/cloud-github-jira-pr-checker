/* eslint-disable no-console */

/*
 * Required Imports
 */

const approvals = require("../services/approvals.js");
const utilities = require("../services/utilities.js");

/**
 * Main function, runs on execution.
 *
 * @return {void}
 */

function run() {
    // retrieve project key
    const projectKey = utilities.getProjectKey();
    // if a valid project key is found, continue execution
    if (projectKey) {
        approvals.check(projectKey);
        // else if valid project key not found
    } else {
        utilities.handleError(3); // error code: no project key found
    }
}

exports.run = run;
