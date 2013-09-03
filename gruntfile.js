/* globals require, module */
var fs = require("fs");

function getFilesSync(directory, buffer)
{
    if (!buffer)
    {
        buffer = [];
    }

    var files = fs.readdirSync(directory);
    for (var i=0; i<files.length; i++)
    {
        var file = directory + "/" + files[i];
        if (fs.lstatSync(file).isDirectory())
        {
            getFilesSync(file, buffer);
        }
        else
        {
            buffer.push(file);
        }
    }

    return buffer;
}

function getUglifyConfig()
{
    var ret = {};

    var files = getFilesSync("dist");
    for (var i=0; i<files.length; i++)
    {
        if (files[i].indexOf(".js") < 0)
        {
            continue;
        }

        var minFile = files[i].replace(".js", ".min.js");
        ret[minFile] = [ files[i] ];
    }

    return ret;
}

function appendJsCopyConfig(config)
{
    config = config || [];

    var files = getFilesSync("js");
    for (var i=0; i<files.length; i++)
    {
        if (files[i].indexOf("js/jquery.modalDialog") === 0)
        {
            continue;
        }

        config.push({
            expand: true,
            src: [files[i]],
            dest: "dist/",
            flatten: true
        });
    }

    return config;
}

function getLessConfig()
{
    var ret = {};

    var files = getFilesSync("css");
    for (var i=0; i<files.length; i++)
    {
        if (files[i].indexOf(".less") < 0)
        {
            continue;
        }

        if (files[i].indexOf("_lib.less") >= 0)
        {
            continue;
        }

        ret["dist/" + files[i].replace(".less", ".css")] = files[i];
    }

    return ret;
}

module.exports = function(grunt)
{
    var config = 
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
                out: "./site/_site/"
            }
        },
        copy: 
        {
          dist: 
          {
            files: appendJsCopyConfig(
            [
                
                {
                    expand: true,
                    src: ["./images/**"],
                    dest: "dist/"
                },
                {
                    expand: true,
                    src: ["./css/jquery.modalDialog.skins.less"],
                    dest: "dist/"
                }
            ])
          },
          docs:
          {
            files: 
            [
                { expand: true, cwd: "./dist", src: ["**"], dest: "./site/_site/dist/" },
                { expand: true, flatten: true, src: ["LICENSE"], processFile: true, dest: "./site/_site/" }
            ]
          },
          deploy: 
          {
            files: 
            [
                { 
                    expand: true, 
                    cwd: "./site/_site/", 
                    flatten: false, 
                    src: ["**"], 
                    dest: "./.git/docs-temp/" 
                }
            ]
          }
        },
        concat: 
        {
            options: 
            {
              separator: '\n'
            },
            modalDialog: 
            {
              src: ['js/jquery.modalDialog.header.js', 'js/jquery.modalDialog.getSettings.js', 'js/jquery.modalDialog.js', 'js/jquery.modalDialog.deviceFixes.js', 'js/jquery.modalDialog.unobtrusive.js'],
              dest: 'dist/jquery.modalDialog.js'
            },
            modalDialogContent: 
            {
              src: ['js/jquery.modalDialogContent.header.js', 'js/jquery.modalDialog.getSettings.js', 'js/jquery.modalDialogContent.js', 'js/jquery.modalDialog.unobtrusive.js'],
              dest: 'dist/jquery.modalDialogContent.js'
            },
            readme: 
            {
              src: ['site/readme-header.md', 'site/_includes/index-content.md'],
              dest: 'README.md'
            }
        },
        clean:
        {
            options: { force: true },
            build: ['./dist'],
            deploy: ['./.git/docs-temp'],
            docs: ['./site/_site']
        },
        less: 
        {
            main:
            {
                files: getLessConfig()
            }
        },
        jekyll:
        {
            docs:
            {
                options: 
                {
                    src: "./site/",
                    config: "./site/_config.yml",
                    dest: "./site/_site"
                }
            }
        },
        compress: 
        {
            main: {
                options: 
                {
                    archive: './site/skinnyjs.zip'
                },
                files: [
                    { expand: true, src: ['**'], cwd: "./dist", dest: '', filter: 'isFile' } // includes files in path
                ]
            }
        },
        'string-replace': 
        {
            pages: 
            {
                files: 
                [
                    { 
                        expand: true, 
                        cwd: "./site/_site/", 
                        flatten: false, 
                        src: ["*.html"], 
                        dest: "./.git/docs-temp/" 
                    }
                ],
                options: 
                {
                    cwd: "./site/_site/",
                    replacements: [
                        {
                            pattern: /\.\.\/dist\//ig,
                            replacement: "dist-pub/"
                        }
                    ]
                }
            }
        }
    };

    // Project configuration.
    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-groc');

    // Delay loading the uglify configuration until all files are copied
    // to the dist dir. This gives us some indirection to concat files. 
    grunt.registerTask('uglifyDist', function()
    {
        config.uglify = 
        { 
            dist: 
            { 
                files: getUglifyConfig() 
            } 
        };

        grunt.task.run('uglify');
    });

    // Default tasks.
    grunt.registerTask('default', ['verify', 'clean', 'less', 'copy:dist', 'concat:modalDialog', 'concat:modalDialogContent', 'uglifyDist']);

    // Verification tasks
    grunt.registerTask('verify', ['jshint', 'qunit']);

    // For zipping distribution files
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.loadNpmTasks('grunt-string-replace');

    // Travis CI task.
    grunt.registerTask('travis', 'default');

    // Documentation tasks.
    grunt.loadNpmTasks('grunt-jekyll');
    grunt.loadTasks("./site/tasks");
    grunt.registerTask('docs', ['default', 'compress', 'pages', 'groc', 'add-docs-links', 'copy:docs', 'copy:deploy', 'string-replace:pages']);

    grunt.registerTask('pages', ['jekyll']);

    grunt.registerTask('readme', ['jekyll', 'concat:readme']);
};

