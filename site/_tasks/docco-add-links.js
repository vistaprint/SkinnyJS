var fs = require("fs");

var TARGET_HTML = "<th class=\"docs\">";

var processError = function(err) {
    if (err) {
        console.log(err);
        process.exit();
    }
};

var DOCS_ROOT = "./site/_site/docco";
var template = fs.readFileSync("./site/_includes/docfile-header-partial.html", "utf-8");

var processPages = function(directory) {
    var files = fs.readdirSync(directory);

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var filePath = directory + "/" + file;

        if (fs.lstatSync(filePath).isDirectory()) {
            processPages(filePath);
            continue;
        }

        console.log(filePath);

        var content = fs.readFileSync(filePath, "utf-8");

        var wrapperPos = content.indexOf(TARGET_HTML);
        if (wrapperPos < 0) {
            continue;
        }

        var processedTemplate = template.replace(/#file#/gim, file.replace(".html", ".js"));

        wrapperPos += TARGET_HTML.length;

        var newContent = content.substr(0, wrapperPos) +
            processedTemplate +
            content.substr(wrapperPos);

        fs.writeFileSync(filePath, newContent);
    }
};

module.exports = function(grunt) {
    grunt.registerTask("docco-add-links", "Adds shared header links to docco generated files", function() {
        processPages(DOCS_ROOT);
    });
};
