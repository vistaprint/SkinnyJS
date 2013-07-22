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
            files: ['gruntfile.js', 'js/**/*.js'],
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['jshint']);
};