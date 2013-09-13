/* globals module */

function renameFn(extOld, extNew)
{
    return function(dest, path)
    {
        return dest + "/" + path.replace(extOld, extNew);
    };
}

module.exports = function(grunt)
{
    var config = 
    {
        pkg: grunt.file.readJSON("package.json"),
        jshint:
        {
            uses_defaults: ["gruntfile.js", "js/**/*.js"],
            with_overrides: 
            {
                options:
                {
                    jshintrc: "test/.jshintrc"
                },
                files: 
                {
                    src: ["test/**/*.js"]
                }
            },
            options:
            {
                jshintrc: ".jshintrc"
            }
        },
        qunit: {
          all: ["test/*.html"]
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
                files:
                [
                    {
                        expand: true,
                        cwd: "./js/",
                        src: ["**/*.js", "!*modalDialog*"],
                        dest: "dist/"
                    },
                    {
                        expand: true,
                        src: ["./images/**"],
                        dest: "dist/"
                    },
                    {
                        expand: true,
                        src: ["./css/jquery.modalDialog.skins.less"],
                        dest: "dist/"
                    },
                    {
                        expand: true,
                        cwd: "./js/",
                        src: ["./postmessage.htm"],
                        dest: "dist/"
                    }
                ]
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
              separator: "\n"
            },
            modalDialog: 
            {
                src: [
                    "js/jquery.modalDialog.header.js", 
                    "js/jquery.modalDialog.userAgent.js", 
                    "js/jquery.modalDialog.getSettings.js",
                    "js/jquery.modalDialog.js",
                    "js/jquery.modalDialog.deviceFixes.js",
                    "js/jquery.modalDialog.unobtrusive.js"
                ],
                dest: "dist/jquery.modalDialog.js"
            },
            modalDialogContent: 
            {
                src: [
                    "js/jquery.modalDialogContent.header.js",
                    "js/jquery.modalDialog.userAgent.js",
                    "js/jquery.modalDialog.getSettings.js",
                    "js/jquery.modalDialogContent.js",
                    "js/jquery.modalDialog.deviceFixes.js", 
                    "js/jquery.modalDialog.unobtrusive.js"
                ],
                dest: "dist/jquery.modalDialogContent.js"
            },
            readme: 
            {
                src: ["site/readme-header.md", "site/_includes/index-content.md"],
                dest: "README.md"
            }
        },
        clean:
        {
            options: { force: true },
            build: ["./dist"],
            deploy: ["./.git/docs-temp"],
            docs: ["./site/_site"]
        },
        less: 
        {
            main:
            {
                files: 
                [
                    {
                        expand: true,
                        cwd: "./css",
                        src: ["*.less"],
                        dest: "./dist/css",
                        rename: renameFn(".less", ".css")
                    }
                ]
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
                    archive: "./site/skinnyjs.zip"
                },
                files: [
                    { expand: true, src: ["**"], cwd: "./dist", dest: "", filter: "isFile" } // includes files in path
                ]
            }
        },
        "string-replace": 
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
                        dest: "./site/_site/" 
                    }
                ],
                options: 
                {
                    cwd: "./site/_site/",
                    replacements: [
                        {
                            pattern: /\.\.\/dist\//ig,
                            replacement: "dist/"
                        }
                    ]
                }
            }
        },
        watch: 
        {
            modalDialog: 
            {
                files: ["./js/**/*.modalDialog.*.js"],
                tasks: ["concat:modalDialog", "concat:modalDialogContent"]
            },
            less:
            {
                files: ["./css/**/*.less"],
                tasks: ["less"]
            },
            options: 
            {
                spawn: false
            }
        }
    };

    // on watch events configure less:main to only run on changed file
    grunt.event.on("watch", function(action, filepath) 
    {
        grunt.config(["less", "main"], filepath);
    });

    // Project configuration.
    grunt.initConfig(config);

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-groc");

    // // Delay loading the uglify configuration until all files are copied
    // // to the dist dir. This gives us some indirection to concat files. 
    // grunt.registerTask("uglifyDist", function()
    // {
    //     config.uglify = 
    //     { 
    //         dist: 
    //         { 
    //             files: 
    //             [{
    //                 expand: true,
    //                 cwd: "dist",
    //                 src: ["**.js"],
    //                 dest: "dist",
    //                 rename: renameFn(".js", ".min.js")
    //             }]
    //         } 
    //     };

    //     grunt.task.run("uglify");
    // });

    // Default tasks.
    grunt.registerTask("default", ["verify", "build"]);

    // Verification tasks
    grunt.registerTask("verify", ["jshint", "qunit"]);

    grunt.registerTask("build", ["clean", "less", "copy:dist", "concat:modalDialog", "concat:modalDialogContent", "uglifyDist"]);

    // For zipping distribution files
    grunt.loadNpmTasks("grunt-contrib-compress");

    grunt.loadNpmTasks("grunt-string-replace");

    grunt.loadNpmTasks("grunt-contrib-watch");

    // Travis CI task.
    grunt.registerTask("travis", "default");

    // Documentation tasks.
    grunt.loadNpmTasks("grunt-jekyll");
    grunt.loadTasks("./site/tasks");
    grunt.registerTask("docs", ["default", "compress", "pages", "groc", "add-docs-links", "string-replace:pages", "copy:docs", "copy:deploy"]);

    grunt.registerTask("pages", ["jekyll"]);

    grunt.registerTask("readme", ["jekyll", "concat:readme"]);
};

