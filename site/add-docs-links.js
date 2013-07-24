var fs = require("fs");

var WRAPPER_HTML = "<div class=\"comments\"><div class=\"wrapper\">";

var processError = function(err)
{
    if (err)
    {
        console.log(err);
        process.exit();
    }
};

var DOCS_ROOT = "./.git/docs-temp/js";
var template = fs.readFileSync("./site/docfile-template.html", "utf-8");

var processPages = function(directory)
{
    var files = fs.readdirSync(directory);

    for (var i=0; i<files.length; i++)
    {
        var file = files[i];
        var filePath = directory + "/" + file;
        
        if (fs.lstatSync(filePath).isDirectory())
        {
            processPages(filePath);
            continue;
        }

        console.log(filePath);

        var content = fs.readFileSync(filePath, "utf-8");

        var wrapperPos = content.indexOf(WRAPPER_HTML);
        if (wrapperPos < 0)
        {
            continue;
        }

        var processedTemplate = template.replace(/#file#/gim, file.replace(".html", ".js"));

        wrapperPos += WRAPPER_HTML.length;

        var newContent = content.substr(0, wrapperPos) +
            processedTemplate +
            content.substr(wrapperPos);

        fs.writeFileSync(filePath, newContent);
    }
};

module.exports = function() { processPages(DOCS_ROOT); };