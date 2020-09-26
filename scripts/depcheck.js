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

const markdown = "";

const createMarkdownList = (elements) => {
  let output = "";
  if (elements.length > 0) {
    for (element of elements) {
      output += `* ${element} \n`;
    }
  } else {
    output += "None 👍👌👍 \n";
  }
  return output;
};

const createMarkdown = (packageName, filename) => {
  return (unused) => {
    let output = `### ${packageName} \n`;
    output += "### Unused dependecies: \n";
    output += createMarkdownList(unused.dependencies);
    output += "### Unused devDependecies: \n";
    output += createMarkdownList(unused.devDependencies);
    output += "### Missing dependecies: \n";
    output += createMarkdownList(Object.keys(unused.missing));
    fs.appendFileSync(filename, output, (err) => {
      if (err) {
        throw err;
      }
    });
  };
};

const packages = ["client", "api"];
const markdownFilePath = path.join(__dirname, `depcheck-report.md`);
for (package of packages) {
  const packagePath = path.join(__dirname, `../${package}`);
  const markdownCallback = createMarkdown(package, markdownFilePath);
  depcheck(packagePath, options, markdownCallback);
}
