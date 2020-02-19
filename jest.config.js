module.exports = {
  "roots": [
    "./src",
  ],
  "collectCoverage": true,
  "verbose": true,
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/index.ts"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest",
  },
}
