/* globals module */

function renameFn(extOld, extNew) {
    return function (dest, path) {
        return dest + "/" + path.replace(extOld, extNew);
    };
}

module.exports = function (grunt) {
    var config = {
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            uses_defaults: ["gruntfile.js", "js/**/*.js"],
            with_overrides: {
                options: {
                    jshintrc: "test/.jshintrc"
                },
                files: {
                    src: ["test/**/*.js"]
                }
            },
            options: {
                jshintrc: ".jshintrc"
            }
        },
        "js-test": {
            options: {
                pattern: "test/*.unittests.js",
                deps: [
                    "dependencies/jquery.js",
                    "test/unittests.shared.js"
                ]
            },
            jquery17: {
                options: {
                    pattern: [
                        "test/jquery.partialLoad.unittests.js",
                        "test/jquery.disableEvent.unittests.js",
                    ],
                    deps: [
                        "dependencies/jquery-1.7.2.js",
                        "test/unittests.shared.js"
                    ]
                }
            },
            jquery110: {
                options: {
                    pattern: "test/jquery.partialLoad.unittests.js",
                    deps: [
                        "dependencies/jquery-1.10.2.js",
                        "test/unittests.shared.js"
                    ]
                }
            },
            dialogSmallScreen: {
                options: {
                    pattern: "test/jquery.modalDialog.*.unittests.js",
                    deps: [
                        "dependencies/jquery.js",
                        "test/unittests.shared.js"
                    ],
                    inject: "smallscreen=1"
                }
            },
        },
        copy: {
            distJs: {
                files: [{
                    expand: true,
                    cwd: "./js/",
                    src: ["**/*.js", "!*modalDialog*"],
                    dest: "dist/"
                }]
            },
            distCss: {
                files: [{
                    expand: true,
                    src: ["./css/jquery.modalDialog.skins.less"],
                    dest: "dist/"
                }]
            },
            distOther: {
                files: [{
                    expand: true,
                    src: ["./images/**"],
                    dest: "dist/"
                }, {
                    expand: true,
                    cwd: "./js/",
                    src: ["./postmessage.htm"],
                    dest: "dist/"
                }, {
                    expand: true,
                    cwd: "./dependencies/",
                    src: ["./*.js"],
                    dest: "dist/dependencies/"
                }]
            }
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "dist",
                    src: ["**.js"],
                    dest: "dist",
                    rename: renameFn(".js", ".min.js")
                }]
            }
        },
        concat: {
            options: {
                separator: "\n"
            },
            modalDialog: {
                src: [
                    "js/jquery.modalDialog.header.js",
                    "js/jquery.modalDialog.userAgent.js",
                    "js/jquery.modalDialog.getSettings.js",
                    "js/jquery.modalDialog.js",
                    "js/jquery.modalDialog.deviceFixes.js",
                    "js/jquery.modalDialog.unobtrusive.js",
                    "js/jquery.modalDialog.history.js"
                ],
                dest: "dist/jquery.modalDialog.js"
            },
            modalDialogContent: {
                src: [
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
        clean: {
            options: {
                force: true
            },
            build: ["./dist"]
        },
        less: {
            main: {
                files: [{
                    expand: true,
                    cwd: "./css",
                    src: ["*.less"],
                    dest: "./dist/css",
                    rename: renameFn(".less", ".css")
                }]
            }
        },
        "strip_code": {
            options: {},
            all: {
                src: "./dist/**.js"
            }
        },
        watch: {
            modalDialog: {
                files: ["./js/**/*.modalDialog*.js"],
                tasks: ["concat:modalDialog", "concat:modalDialogContent"]
            },
            copyJs: {
                files: ["./js/**/*.js", "!**modalDialog**"],
                tasks: ["copy:distJs"]
            },
            less: {
                files: ["./css/**/*.less"],
                tasks: ["less"]
            },
            options: {
                spawn: false
            }
        },
        jsbeautifier : {
            all: {
                src: ["js/**/*.js", "test/**/*.js"],
                options: { js: { jslintHappy: true } }
            }
        },
        lineending : {
            all: {
                files: [
                    {
                        expand: true,
                        cwd: "./js/",
                        src: ["./**/*.js"],
                        dest: "./js/"
                    }, {
                        expand: true,
                        cwd: "./test/",
                        src: ["./**/*.js"],
                        dest: "./test/"
                    }
                ],
                options: {
                    eol: "crlf"
                }
            }
        },
        wget: {
            basic: {
                options: {
                    overwrite: true,
                    baseUrl: "http://vistaprint.github.io/PointyJS/"
                },
                files: {
                    "js/pointy.js": "dist/pointy.js",
                    "js/pointy.gestures.js": "dist/pointy.gestures.js"
                }
            }
        }
    };

    // Project configuration.
    grunt.initConfig(config);

    // NPM tasks
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-js-test");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-strip-code");
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks("grunt-lineending");
    grunt.loadNpmTasks("grunt-wget");

    grunt.registerTask("travis", "default");

    grunt.registerTask("default", ["verify", "build"]);

    grunt.registerTask("test", ["less", "js-test", "js-test:jquery17", "js-test:jquery110", "js-test:dialogSmallScreen"]);

    grunt.registerTask("verify", ["jshint", "test"]);

    grunt.registerTask("copyDist", ["copy:distJs", "copy:distCss", "copy:distOther"]);

    grunt.registerTask("build", ["clean", "less", "copyDist", "concat:modalDialog", "concat:modalDialogContent", "strip_code", "uglify"]);

    grunt.registerTask("beautify", ["jsbeautifier", "lineending"]);

    grunt.registerTask("update", ["wget"]);
};
