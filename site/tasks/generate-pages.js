var marked = require("marked");
var path = require("path");
var CONTENT_TOKEN = "<!--ContentStart-->";

module.exports = function(grunt)
{
    grunt.registerMultiTask('gen-pages', 'Generate pages from markdown', function() 
    {
        var path2 = path;
        var template = grunt.file.read(this.data.template);

        var files = grunt.file.expand(this.data.src);
        for (var i=0; i<files.length; i++)
        {
            var markdown = grunt.file.read(files[i]);

            var contentStartPos = markdown.indexOf(CONTENT_TOKEN);
            if (contentStartPos >= 0)
            {
                markdown = markdown.substr(contentStartPos + CONTENT_TOKEN.length);
            }

            var processedMarkdown = marked(markdown);
            var processedTemplate = template.replace("#content#", processedMarkdown);

            var outputPath;

            // The output is a directory
            if (this.data.dest[this.data.dest.length-1] == "/")
            {
                var fileName = files[i].replace(".md", ".html");
                if (this.data.remove)
                {
                    fileName = fileName.replace(this.data.remove, "");
                }
                outputPath = path.join(this.data.dest, fileName);
            }
            else
            {
                // The output is a file
                outputPath = this.data.dest;
            }

            grunt.file.write(outputPath, processedTemplate);
            
        }
    });
};