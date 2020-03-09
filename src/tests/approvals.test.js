/* eslint-disable no-undef */
// load required modules
const approvals = require("../services/approvals");

// initialize testing consts
const issue = "PROJ-123";
const releaseState = "Ready to Release";

test("checks for issue equivalence", () => {
    expect(approvals.issueCheck(issue, issue)).toBe(true);
});

test("checks for issue unequivalence", () => {
    expect(approvals.issueCheck(issue, "test")).toBe(false);
});

test("checks for state equivalence", () => {
    expect(approvals.statusCheck(releaseState, releaseState)).toBe(true);
});

test("checks for state unequivalence", () => {
    expect(approvals.statusCheck(releaseState, "test")).toBe(false);
});
