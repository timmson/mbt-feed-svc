module.exports = {
	collectCoverage: true,
	collectCoverageFrom: ["./src/*"],
	coverageReporters: ["lcov"],
	testMatch: ["**/test/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"]
}