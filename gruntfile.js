/*jshint node: true */
/*global module */

var generateHomepage = require("./site/generate-homepage");

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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-groc');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'qunit']);

    // Travis CI task.
    grunt.registerTask('travis', 'default');

    // Documentation task(s).
    grunt.registerTask('gen-homepage', "Generates index.html from README.md", generateHomepage);
    grunt.registerTask('docs', ['gen-homepage', 'groc']);
};