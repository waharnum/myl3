/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid */

(function ($, fluid) {

    "use strict";

    fluid.defaults("floe.dashboard.inferredView.demo", {
        gradeNames: ["floe.dashboard.inferredView"],
        modelListeners: {
            "*": {
                "this": "console",
                "method": "log",
                "args": ["modelChange", "{change}.path", "{change}.value"]
            }
        }
    });

})(jQuery, fluid);
