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

    // Time-aware grade
    // Largely designed to assist in time-based persistence strategies
    // by providing created & last modified timestamps in the model of
    // implementating grades, it additionally provides basic formatted
    // dates and times to the model
    //
    // Implementing grades should themselves implement model listeners
    // calling the floe.dashboard.eventInTimeAware.setModifiedTimeStamp
    // function to update the modified stamp on "consequential" changes to
    // the component model
    fluid.defaults("floe.dashboard.eventInTimeAware", {
        gradeNames: "fluid.modelComponent",
        model: {
            // A series of key-timestamp pairs
            // implementing grades with other timestamping needs should store
            // any timestamps here
            // Default timestamp approach used is Date.prototype.toJSON()
            timeEvents: {
                // created: "",
                // modified: ""
            },
            // Formatted human-friendly representation of the date portion
            // of the timestamp
            // Created automatically by model relay
            formattedDates: {
                "created": null,
                "modified": null
            },
            // Formatted human-friendly representation of the time portion
            // of the timestamp
            // Created automatically by model relay
            formattedTimes: {
                "created": null,
                "modified": null
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
                target: "{that}.model.formattedDates.modified",
                singleTransform: {
                    input: "{that}.model.timeEvents.modified",
                    type: "fluid.transforms.free",
                    args: ["{that}.model.timeEvents.modified"],
                    func: "floe.dashboard.eventInTimeAware.getFormattedDate"
                }
            },
            {
                target: "{that}.model.formattedTimes.modified",
                singleTransform: {
                    input: "{that}.model.timeEvents.modified",
                    type: "fluid.transforms.free",
                    args: ["{that}.model.timeEvents.modified"],
                    func: "floe.dashboard.eventInTimeAware.getFormattedTime"
                }
            },
        ],
        listeners: {
            "onCreate.setInitialTimeStamps": {
                func: "floe.dashboard.eventInTimeAware.setInitialTimeStamps",
                args: ["{that}"]
            }
        },
        invokers: {
            setModifiedTimeStamp: {
                funcName: "floe.dashboard.eventInTimeAware.setModifiedTimeStamp",
                args: ["{that}"]
            }
        }
    });

    // Sets the initial created and modified timestamps to the current
    // time, if they don't exist in the model
    floe.dashboard.eventInTimeAware.setInitialTimeStamps = function (that) {
        var created = that.model.timeEvents.created ? new Date(that.model.timeEvents.created) : new Date();

        // Respect the modified date if it exists & is parseable;
        var modified = that.model.timeEvents.modified ? new Date(that.model.timeEvents.modified) : created;

        var changes = {
            created: created.toJSON(),
            modified: modified.toJSON()
        };
        that.applier.change("timeEvents", changes);
    };

    // Sets the modified time stamp to the current time
    // has a custom source for the change so that aggressive model listeners
    // (such as those that listen to the entire component model, including
    // timeEvents.modified) can filter it out if needed via the excludeSource
    // option and avoid infinite modified loops
    floe.dashboard.eventInTimeAware.setModifiedTimeStamp = function (that) {
        var modifiedTimestamp = new Date();
        that.applier.change("timeEvents.modified", modifiedTimestamp.toJSON(), "ADD", "setModifiedTimeStamp");
    };

    floe.dashboard.eventInTimeAware.getFormattedDate = function (timestamp) {
        return new Date(timestamp).toLocaleDateString();
    };

    floe.dashboard.eventInTimeAware.getFormattedTime = function (timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    };

})(jQuery, fluid);
