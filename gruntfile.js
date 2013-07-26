
var generateHomepage = require("./site/generate-homepage");
var addDocsLinks = require("./site/add-docs-links");

module.exports = function(grunt)
{
    // Project configuration.
    grunt.initConfig(
    {
        pkg: grunt.file.readJSON('package.json'),
        jshint:
        {
            uses_defaults: ['gruntfile.js', 'js/**/*.js'],
            with_overrides: 
            {
                options:
                {
                    globals: {
                        "$": true,
                        "module": true,
                        "test": true,
                        "equal": true,
                        "jQuery": true
                    }
                },
                files: 
                {
                    src: ['test/**/*.js']
                }
            },
            options:
            {
                jshintrc: '.jshintrc'
            }
        },
        qunit: {
          all: ['test/**/*.html']
        },
        groc:
        {
            javascript: ["js/**/*.js"],
            options: 
            {
                out: ".git/docs-temp/"
            }
        },
        copy: 
        {
          docs: 
          {
            files: 
            [
                { expand: true, flatten: true, src: ["site/images/*"], dest: ".git/docs-temp/images/" },
                { expand: true, flatten: true, src: ["site/javascripts/*"], dest: ".git/docs-temp/javascripts/" },
                { expand: true, flatten: true, src: ["site/stylesheets/*"], dest: ".git/docs-temp/stylesheets/" }
            ]
          }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-groc');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'qunit']);

    // Travis CI task.
    grunt.registerTask('travis', 'default');

    // Documentation task(s).
    grunt.registerTask('gen-homepage', "Generates index.html from README.md", generateHomepage);
    grunt.registerTask('add-docs-links', "Adds links to documentation pages", addDocsLinks);
    grunt.registerTask('docs', ['gen-homepage', 'groc', 'add-docs-links', 'copy:docs']);
};