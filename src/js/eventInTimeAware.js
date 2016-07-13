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

    // A grade that deals in time,
    // and things related to time
    fluid.defaults("floe.dashboard.eventInTimeAware", {
        gradeNames: "fluid.modelComponent",
        model: {
            // A series of key-timestamp pairs
            timeEvents: {
                // created: "",
                // lastModified: ""
            },
            formattedDates: {
                "created": null,
                "lastModified": null
            },
            formattedTimes: {
                "created": null,
                "lastModified": null
            }
        },
        modelRelay: [
            {
                target: "{that}.model.formattedDates.created",
                singleTransform: {
                    input: "{that}.model.timeEvents.created",
                    type: "fluid.transforms.free",
                    args: ["{that}.model.timeEvents.created"],
                    func: "floe.dashboard.eventInTimeAware.getFormattedDate"
                }
            },
            {
                target: "{that}.model.formattedTimes.created",
                singleTransform: {
                    input: "{that}.model.timeEvents.created",
                    type: "fluid.transforms.free",
                    args: ["{that}.model.timeEvents.created"],
                    func: "floe.dashboard.eventInTimeAware.getFormattedTime"
                }
            },
            {
                target: "{that}.model.formattedDates.lastModified",
                singleTransform: {
                    input: "{that}.model.timeEvents.lastModified",
                    type: "fluid.transforms.free",
                    args: ["{that}.model.timeEvents.lastModified"],
                    func: "floe.dashboard.eventInTimeAware.getFormattedDate"
                }
            },
            {
                target: "{that}.model.formattedTimes.lastModified",
                singleTransform: {
                    input: "{that}.model.timeEvents.lastModified",
                    type: "fluid.transforms.free",
                    args: ["{that}.model.timeEvents.lastModified"],
                    func: "floe.dashboard.eventInTimeAware.getFormattedTime"
                }
            },
        ],
        listeners: {
            "onCreate.setCreatedTimeStamp": {
                func: "floe.dashboard.eventInTimeAware.setCreatedTimeStamp",
                args: ["{that}"]
            },
        },
        // We update "timeEvents.lastModified" whenever the model is updated
        // except on initialization, or from the setModifiedTimeStamp
        // function itself
        modelListeners: {
            "": {
                funcName: "floe.dashboard.eventInTimeAware.setModifiedTimeStamp",
                args: "{that}",
                excludeSource: ["init", "setModifiedTimeStamp"]
            }
        }
    });

    floe.dashboard.eventInTimeAware.setCreatedTimeStamp = function (that) {
        // Only set the timestamp to current time if the model's current one is falsey
        var timestamp = that.model.timeEvents.created ? new Date(that.model.timeEvents.created) : new Date();
        that.applier.change("timeEvents.created", timestamp.toJSON());
    };

    floe.dashboard.eventInTimeAware.setModifiedTimeStamp = function (that) {
        var modifiedTimestamp = new Date();
        that.applier.change("timeEvents.lastModified", modifiedTimestamp.toJSON(), "ADD", "setModifiedTimeStamp");
    };

    floe.dashboard.eventInTimeAware.getFormattedDate = function (timestamp) {
        console.log(timestamp);
        var formatted = new Date(timestamp);
        return formatted.toLocaleDateString();
    };

    floe.dashboard.eventInTimeAware.getFormattedTime = function (timestamp) {
        console.log(timestamp);
        var formatted = new Date(timestamp);
        return formatted.toLocaleTimeString();
    };

})(jQuery, fluid);
