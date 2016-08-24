/*
Copyright 2016 OCAD University
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

// Declare dependencies
/* global module */

module.exports = function (grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        // Project package file destination.
        pkg: grunt.file.readJSON("package.json"),
        eslint: {
            all: ["src/**/*.js", "tests/**/*.js", "demos/**/*.js", "examples/**/*.js"]
        },
        jsonlint: {
            all: ["package.json", ".jshintrc", "tests/**/*.json", "demos/**/*.json", "src/**/*.json", "!src/lib/**"]
        },
        copy: {
            // Copy external front end dependencies into appropriate directories
            frontEndDependencies: {
                files: [
                    // PouchDB
                    {expand: true, cwd: "./node_modules/pouchdb/", src: "**", dest: "./src/lib/pouchdb/"},
                    // jsonlint
                    {expand: true, cwd: "./node_modules/jsonlint/", src: "**", dest: "./src/lib/jsonlint/"},
                    // gpii-pouchdb
                    {expand: true, cwd: "./node_modules/gpii-pouchdb/", src: "**", dest: "./src/lib/gpii-pouchdb/"},

                ]
            }
        }
    });

    // Load the plugin(s):
    grunt.loadNpmTasks("fluid-grunt-eslint");
    grunt.loadNpmTasks("grunt-jsonlint");
    grunt.loadNpmTasks("grunt-contrib-copy");

    // Custom tasks:

    grunt.registerTask("default", ["lint"]);
    grunt.registerTask("lint", "Apply eslint and jsonlint", ["eslint", "jsonlint"]);
};
