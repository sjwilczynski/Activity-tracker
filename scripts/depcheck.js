const depcheck = require("depcheck");
const path = require("path");
const fs = require("fs");

const options = {
  ignoreMatches: [
    // ignore dependencies that matches these globs
    "eslint-*",
    "babel-*",
  ],
};

const createMarkdownList = (elements) => {
  let output = " ";
  if (elements.length > 0) {
    output += "\n";
    for (const element of elements) {
      output += `  * ${element} \n`;
    }
  } else {
    output += "None 👍👌👍 \n";
  }
  return output;
};

const createMarkdown = (packageName, filename) => {
  return (unused) => {
    let output = `### ${packageName} \n`;
    output += "* Unused dependecies:";
    output += createMarkdownList(unused.dependencies);
    output += "* Unused devDependecies:";
    output += createMarkdownList(unused.devDependencies);
    output += "* Missing dependecies:";
    output += createMarkdownList(Object.keys(unused.missing));
    fs.appendFileSync(filename, output, (err) => {
      if (err) {
        throw err;
      }
    });
  };
};

const packageNames = ["client", "api"];
const markdownFilePath = path.join(__dirname, `depcheck-report.md`);
fs.appendFileSync(markdownFilePath, "## Depcheck report \n", (err) => {
  if (err) {
    throw err;
  }
});
for (const packageName of packageNames) {
  const packagePath = path.join(__dirname, `../${packageName}`);
  const markdownCallback = createMarkdown(packageName, markdownFilePath);
  depcheck(packagePath, options, markdownCallback);
}
