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
        qunit: 
        {
            options: 
            {
                "--web-security": "false"
            },
            all: ["test/*.html"]
        },
        docco:
        {
            javascript: 
            {
                src: ["js/**/*.js"],
                dest: "./site/_site/docco/"
            }
        },
        mkdir:
        {
            docco:
            {
                options:
                {
                    create: ["./site/_site/docco/"]
                }
            }
        },
        copy: 
        {
            distJs: 
            {
                files:
                [
                    {
                        expand: true,
                        cwd: "./js/",
                        src: ["**/*.js", "!*modalDialog*"],
                        dest: "dist/"
                    }
                ]
            },
            distCss:
            {
                files:
                [
                    {
                        expand: true,
                        src: ["./css/jquery.modalDialog.skins.less"],
                        dest: "dist/"
                    }
                ]
            },
            distOther:
            {
                files:
                [
                    {
                        expand: true,
                        src: ["./images/**"],
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
            distSite:
            {
                files: 
                [
                    { expand: true, cwd: "./dist", src: ["**"], dest: "./site/_site/dist/" },
                    { expand: true, flatten: true, src: ["LICENSE"], processFile: true, dest: "./site/_site/" }
                ]
            },
            doccoFix:
            {
                files: 
                [
                    { expand: true, cwd: "./site/_docco/", src: ["**"], dest: "./site/_site/docco" }
                ]
            },
            deploy: 
            {
                files: 
                [{ 
                    expand: true, 
                    cwd: "./site/_site/", 
                    flatten: false, 
                    src: ["**"], 
                    dest: "./.git/docs-temp/" 
                }]
              }
        },
        uglify:
        {
            dist: 
            { 
                files: 
                [{
                    expand: true,
                    cwd: "dist",
                    src: ["**.js"],
                    dest: "dist",
                    rename: renameFn(".js", ".min.js")
                }]
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
                src: 
                [
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
                src: 
                [
                    "js/jquery.modalDialogContent.header.js",
                    "js/jquery.modalDialog.userAgent.js",
                    "js/jquery.modalDialog.getSettings.js",
                    "js/jquery.modalDialogContent.js",
                    "js/jquery.modalDialog.deviceFixes.js", 
                    "js/jquery.modalDialog.unobtrusive.js"
                ],
                dest: "dist/jquery.modalDialogContent.js"
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
            main: 
            {
                options: 
                {
                    archive: "./site/skinnyjs.zip"
                },
                files: 
                [
                    { expand: true, src: ["**"], cwd: "./dist", dest: "", filter: "isFile" } // includes files in path
                ]
            }
        },
        "string-replace": 
        {
            site: 
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
                    replacements:
                    [
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
                files: ["./js/**/*.modalDialog*.js"],
                tasks: ["concat:modalDialog", "concat:modalDialogContent", "copy:distSite"]
            },
            copyJs: 
            {
                files: ["./js/**/*.js", "!**modalDialog**"],
                tasks: ["copy:distJs", "copy:distSite"]
            },
            less:
            {
                files: ["./css/**/*.less"],
                tasks: ["less", "copy:distSite"]
            },
            jekyll:
            {
                files: ["./site/**/*", "!./site/_site/*"],
                tasks: ["sitePages"]
            },
            options: 
            {
                spawn: false
            }
        }
    };

    // Project configuration.
    grunt.initConfig(config);

    // NPM tasks
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-docco");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-string-replace");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-jekyll");
    grunt.loadNpmTasks("grunt-mkdir");

    // Custom tasks
    grunt.loadTasks("./site/_tasks");

    grunt.registerTask("travis", "default");

    grunt.registerTask("default", ["verify", "build"]);

    grunt.registerTask("verify", ["less", "jshint", "qunit"]);

    grunt.registerTask("copyDist", ["copy:distJs", "copy:distCss", "copy:distOther"]);

    grunt.registerTask("build", ["clean", "less", "copyDist", "concat:modalDialog", "concat:modalDialogContent", "uglify"]);
    
    grunt.registerTask("docs", ["mkdir:docco", "docco", "docco-add-links", "copy:doccoFix"]);

    grunt.registerTask("site", ["default", "compress", "sitePages", "docs", "copy:deploy"]);

    grunt.registerTask("sitePages", ["jekyll", "string-replace:site", "copy:distSite"]);
};

