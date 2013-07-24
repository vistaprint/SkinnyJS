var marked = require("marked");
var fs = require("fs");

var CONTENT_START_TOKEN = "<!--ContentStart-->";

var processError = function(err)
{
    if (err)
    {
        console.log(err);
        done();
        process.exit();
    }
};

var generateHomepage = function()
{
    // Tells grunt to run async
    var done = this.async();

    fs.readFile("./README.md", "utf-8", function(err, markdown)
    {
        processError(err, done);

        var contentStartPos = markdown.indexOf(CONTENT_START_TOKEN);
        if (contentStartPos >= 0)
        {
            markdown = markdown.substr(contentStartPos + CONTENT_START_TOKEN.length);
        }

        marked(markdown, { gfm: true }, function(err, processedMarkdown)
        {
            processError(err, done);

            fs.readFile("./site/index-template.html", "utf-8", function(err, template)
            {
                processError(err, done);

                var processedTemplate = template.replace("#content#", processedMarkdown);

                fs.writeFile("./.git/docs-temp/index.html", processedTemplate, function(err)
                {
                    processError(err, done);

                    done();
                });
            });
        });
    });
};

module.exports = generateHomepage;