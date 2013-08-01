var marked = require("marked");
var path = require("path");
var CONTENT_START_TOKEN = "<!--ContentStart-->";
var CONTENT_END_TOKEN = "<!--ContentEnd-->"


function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = function(grunt)
{
    grunt.registerMultiTask('gen-pages', 'Generate pages from markdown', function() 
    {
        var path2 = path;
        var template = grunt.file.read(this.data.template);

        var files = grunt.file.expand(this.data.src);
        for (var i=0; i<files.length; i++)
        {
            // Filter files that shouldn't be processed
            if (this.data.filter)
            {
                if (files[i].match(new RegExp(this.data.filter, "gi")))
                {
                    continue;
                }
            }

            var originalFile = grunt.file.read(files[i]);

            // Files may have content tokens- if they add this, everything before the
            // token will be ignored.
            var contentStartPos = originalFile.indexOf(CONTENT_START_TOKEN);
            if (contentStartPos >= 0)
            {
                originalFile = originalFile.substr(contentStartPos + CONTENT_START_TOKEN.length);
            }

            var contentEndPos = originalFile.indexOf(CONTENT_END_TOKEN);
            if (contentEndPos >= 0)
            {
                originalFile = originalFile.substr(0, contentEndPos);
            }
            
            // Process the markdown (or use the raw HTML)
            var processedoriginalFile = this.data.rawHtml ? originalFile : marked(originalFile);

            var processedTemplate = template.replace("#content#", processedoriginalFile);

            // If a urlBase is specified, apply it to any URLs in the HTML document.
            // This is usefull to transform absolute paths from markdown into relative paths in HTML.
            if (this.data.urlBase)
            {
                processedTemplate = processedTemplate.replace(new RegExp(escapeRegExp(this.data.urlBase), 'gim'), "");
            }

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