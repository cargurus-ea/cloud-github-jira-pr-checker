# GitHub Action: Jira PR Checker
![unit-test](https://github.com/alaplanteCG/cloud-pr-checker/workflows/unit-test/badge.svg)
<img src="https://img.shields.io/badge/eslint--plugin-cargurus--base-orange" />
<img src="https://img.shields.io/badge/prod--version-v1-blue" />
<img src="https://img.shields.io/github/v/release/alaplanteCG/cloud-pr-checker?include_prereleases" />

This simple action scans a pull request name for an associated Jira Issue project key and then using the npm package jira-connector checks the provided Jira instance for the existence of the given Jira Issue. If the Issue is found the release state is then compared against the provided Jira release state. If each of these checks pass, the PR is approved and a PR review approving the merge is created. If any of the checks fail, a PR review requesting the specific changes is created and the merge is blocked.



## Checks Implemented

### Existence Check
The existence check is designed to verify that a valid Jira project key exists within the PR title. Once found, it then queries the provided Jira instance to ensure that the found project key corresponds to an actual Jira issue. The pattern used to check for a valid project key is defined within the `project_pattern` input. By default the project pattern consists of at least one letter (case-insensitive) followed by a dash ("-") which is then proceeded by at least one digit. 

### State Check
The state check is to designed to verify that the corresponding Jira issue is in the correct state for release. The correct release state is defined within the `release_state` input. This test is agreed upon within the EA teams as an acceptable solution to ensure sox compliancy with the rationale being to reach the defined release state all compliancy checks have already happened within Jira. 

### Financial Impact Check
The financial impact check is designed to validate that any neccessary SOX approvals for finance related Jiras have been provided. As of right now, it is non-functional and passes no matter what if it is reached. If different Sox Compliancy requirements are created within the EA Team, this functionality will be expanded upon. If you / your team need more advanced SOX Compliancy checking feel free to fork and develop yourself or contact @alaplanteCG. 

## Inputs

### `jira_url`

**Required.** Must be in the form of <i>company</i>.atlassian.net </br>

**Default:**

### `jira_consumer_key`

**Required.** Consumer key used to create the application link in Jira. Should be stored as a secret and referenced in form `jira_auth: ${{ secrets.JIRA_CONSUMER_KEY }}`.</br>

**Default:**

### `jira_access_token`

**Required.** Access Token generated from Jira OAuth handshake. Should be stored as a secret and referenced in form `jira_auth: ${{ secrets.JIRA_ACCESS_TOKEN }}`.</br>

**Default:**

### `jira_token_secret`

**Required.** Token secret generated from Jira OAuth handshake. Should be stored as a secret and referenced in form `jira_auth: ${{ secrets.JIRA_TOKEN_SECRET }}`.</br>

**Default:**

### `jira_private_key`

**Required.** Private key that corresponds to consumer key used create application link in Jira. Should be stored as a secret and referenced in form `jira_auth: ${{ secrets.JIRA_PRIVATE_KEY }}`.</br>

**Default:**

### `jira_release_state`

**Required.**  The Jira state an issue must be in to be considered "Ready to Release". </br>

**Default:** "Ready to Release"

### `project_pattern`

**Required.**  Regex pattern used to identify projects in PR names. By Default it will find any strings in the format XXX-123 where XXX is at least one letter (not case sensitive) and 123 is at least one integer.</br>

**Default:** '[A-Za-z][A-Za-z]\*-\d\d*'

### `sox_check`

**Required**  Signifies if the workflow should check Jiras for SOX compliancy.</br>

**Default:** false

### `github_token`

**Required.** Github Token needed to post review / comment. Must be in form `github_token: ${{ secrets.GITHUB_TOKEN }}`. This represents the default Github token for the Actions-Bot and is by default available to all repositories. </br>

**IMPORTANT: DO NOT ATTEMPT TO CREATE YOUR OWN GITHUB ACCESS TOKEN FOR THIS WORKFLOW.** </br>

**Default:** false



## Authentication
This app is setup to use OAuth authentication with Jira. To actually setup an OAuth connection with Jira, steps located here: https://confluence.atlassian.com/display/JIRA/Linking+to+Another+Application

If you don't already have an existing OAuth integration you can use you will have to go through the setup steps prior to installing this action into your repository. 



## Example Usage
```yml
name: "jira-check"
on:
  pull_request:
    types: [opened, reopened, edited, synchronize]
jobs:
  # try jira action
  jira:
    runs-on: ubuntu-latest
    steps:
      - uses: alaplanteCG/cloud-pr-checker@v1
        with:
          jira_url: "alaplante.atlassian.net"
          jira_consumer_key: ${{ secrets.JIRA_CONSUMER_KEY }}
          jira_access_token: ${{ secrets.JIRA_ACCESS_TOKEN }}
          jira_token_secret: ${{ secrets.JIRA_TOKEN_SECRET }}
          jira_private_key: ${{ secrets.JIRA_PRIVATE_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

To add this action to your repository, create the following file within your repository: ```.github/workflows/jira_pr_checker.yml```.

Once the file has been created, copy the above example code into it. Change the `jira_url` input to your atlassian url. Create secrets within your repository corresponding to each Authenticatation input. 

Create a new branch, add a test file to that branch. Create a new pull request with a valid project key (or not) in the title, observe. To re-run the action, update your test file and push to GH or edit the PR in some way.



## Developer Notes
**The following commands NPM commands are available:**
* `npm install`: Install any missing dependencies from package.json
* `npm run lint`: Runs eslint against all .js files. 
* `npm run package`: Packages source code for distribution. Must be done before pushing a new version.
* `npm run test`: Runs jest against all testing files.
* `npm run generate-docs`: Generates all JSDoc documentation for any .js source files.

**If creating a new fork that you would eventually liked merged into master, please remember to create any applicable unit tests for code you have added / modified. All tests are located within `./src/tests`.**

**Any PRs with missing / failing unit tests will be rejected.**
