import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("Viking Store brand colors", () => {
  it("uses the deep red logo-matched palette in global tokens", () => {
    const variables = read("../assets/css/variables.css");
    const main = read("../assets/css/main.css");

    assert.match(variables, /--color-primary:\s*#cf1d1d/i);
    assert.match(variables, /--color-background:\s*#070707/i);
    assert.match(variables, /--color-background-secondary:\s*#171717/i);
    assert.match(main, /#cf1d1d/i);
    assert.match(main, /#a81616/i);
    assert.doesNotMatch(`${variables}\n${main}`, /#ff4d00|255,\s*77,\s*0|255\s+77\s+0/i);
  });

  it("does not leave the old orange brand accent in app source", () => {
    let output = "";

    try {
      output = execFileSync(
        "rg",
        [
          "#FF4D00|#ff4d00|#FF5F1A|#ff5f1a|255,77,0|255, 77, 0|255 77 0",
          "assets",
          "components",
          "pages",
          "--glob",
          "!pages/admin/**",
        ],
        { encoding: "utf8" },
      );
    } catch (error) {
      if (error.status !== 1) throw error;
    }

    assert.equal(output.trim(), "");
  });
});
