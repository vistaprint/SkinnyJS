/*jshint node: true */
/*global module */

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
                boss: false,
                browser: true,
                curly: true,
                devel: false,
                eqeqeq: false,
                eqnull: true,
                expr: true,
                evil: false,
                immed: true,
                latedef: true,
                laxcomma: false,
                newcap: false,
                noarg: true,
                smarttabs: false,
                sub: true,
                trailing: false,
                undef: true,
                globals:
                {
                    jQuery: true
                }
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
                github: true,
                "repository-url": "https://github.com/labaneilers/SkinnyJS.git"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-groc');

    // Travis CI task.
    grunt.registerTask('travis', 'default');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'qunit']);

    // Default task(s).
    grunt.registerTask('docs', ['groc']);
};