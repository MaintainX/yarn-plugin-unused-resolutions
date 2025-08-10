import { exec } from "child_process";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("yarn-plugin-unused-resolutions", () => {
  function parseOutput(stdout) {
    return stdout
      .split("\n")
      .map((line) => /  - "([^"]+)": "([^"]+)"/.exec(line))
      .filter((line) => line)
      .map((line) => {
        const [, pattern, reference] = line;
        return { pattern, reference };
      });
  }

  it("basic", (context, done) => {
    exec("yarn install", { cwd: "./tests/basic" }, (error, stdout, stderr) => {
      // console.log(stdout);
      // console.log(stderr);
      // console.log(error);

      assert(error);
      const unusedResolutions = parseOutput(stdout);
      assert.deepEqual(unusedResolutions, [
        { pattern: "unused-package", reference: "1.0.0" },
        { pattern: "loose-envify/unused@^2.0.0", reference: "4.0.0" },
      ]);

      done();
    });
  });

  it("clean", (context, done) => {
    exec("yarn install", { cwd: "./tests/clean" }, (error, stdout, stderr) => {
      // console.log(stdout);
      // console.log(stderr);
      // console.log(error);

      assert(!error);
      const unusedResolutions = parseOutput(stdout);
      assert.deepEqual(unusedResolutions, []);

      done();
    });
  });

  it("no-resolutions", (context, done) => {
    exec("yarn install", { cwd: "./tests/no-resolutions" }, (error, stdout, stderr) => {
      // console.log(stdout);
      // console.log(stderr);
      // console.log(error);

      assert(!error);
      const unusedResolutions = parseOutput(stdout);
      assert.deepEqual(unusedResolutions, []);

      done();
    });
  });
});
