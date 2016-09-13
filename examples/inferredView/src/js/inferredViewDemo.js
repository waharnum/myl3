/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe */

(function ($, fluid) {

    "use strict";

    fluid.defaults("floe.dashboard.inferredView.demo", {
        gradeNames: ["floe.dashboard.inferredView"],
        modelListeners: {
            "inferredViews": {
                "this": "console",
                "method": "log",
                "args": ["modelChange", "{change}.path", "{change}.value", "{that}"],
                "namespace": "log"
            }
        }
    });

    fluid.defaults("floe.dashboard.inferredView.demo.pouchPersisted", {
        gradeNames: ["floe.dashboard.pouchPersisted", "floe.dashboard.inferredView.demo"],
        dbOptions: {
            "name": "examples",
        },
        listeners: {
            "onCreate.get": {
                funcName: "{that}.get",
                priority: "before:appendTemplate"
            },
            "onPouchDocRetrieved.setModelFromRetrieved": {
                funcName: "floe.dashboard.inferredView.demo.pouchPersisted.setModelFromRetrieved",
                args: ["{that}", "{arguments}.0"]
            }
        },
        modelListeners: {
            "inferredViews": {
                "funcName": "{that}.persist",
                namespace: "persist",
                excludeSource: "init"
            }
        },
        invokers: {
            // Override the standard timestamp-based approach to a
            // fixed ID, for sake of this example; this allows us to
            // retrieve the relevant persisted grade without needing
            // functionality for search or filtering
            "setPouchId": {
                funcName: "floe.dashboard.pouchPersisted.setPouchIdToString",
                args: ["{that}", "{that}.options.dbOptions.fixedId"]
            }
        }
    });

    floe.dashboard.inferredView.demo.pouchPersisted.setModelFromRetrieved = function (that, retrieved) {
        if(retrieved) {
            that.applier.change("", retrieved);
        }
    };

})(jQuery, fluid);
