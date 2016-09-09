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

    // A datasource grade using pouchDB via gpii-pouch
    fluid.defaults("floe.dashboard.dataSource.pouchDB", {
        gradeNames: ["fluid.dataSource"],
        components: {
            pouch: {
                type: "gpii.pouch",
                options: {
                    dbOptions: {
                        name: "{pouchDB}.options.dbOptions.name"
                    }
                }
            },
            // gpii-pouchdb returns POJOs, not JSON
            encoding: {
                type: "fluid.dataSource.encoding.none"
            }
        },
        invokers: {
            "getImpl": {
                funcName: "floe.dashboard.dataSource.pouchDB.getImpl",
                // options, directModel
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        },
        dbOptions: {
            // name: DB name
        },
        readOnlyGrade: "floe.dashboard.dataSource.pouchDB",
        writable: true,
        deletable: true
    });

    // that, options, directModel
    floe.dashboard.dataSource.pouchDB.getImpl = function (that, options, _id) {
        options = options || {};
        return that.pouch.get(_id, options);
    };

    fluid.defaults("floe.dashboard.dataSource.pouchDB.writable", {
        gradeNames: ["fluid.dataSource.writable", "floe.dashboard.dataSource.pouchDB"],
        invokers: {
            "setImpl": {
                funcName: "floe.dashboard.dataSource.pouchDB.setImpl",
                // options, directModel
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    floe.dashboard.dataSource.pouchDB.setImpl = function (that, options, _id) {
        options = options || {};
        return that.pouch.put(_id, options);
    };

    fluid.defaults("floe.dashboard.dataSource.pouchDB.deletable", {
        gradeNames: ["fluid.dataSource.deletable", "floe.dashboard.dataSource.pouchDB"],
        invokers: {
            "delImpl": {
                funcName: "floe.dashboard.dataSource.pouchDB.delImpl",
                // options, directModel
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    // required for doc
    // {_id:"", _rev:""}
    floe.dashboard.dataSource.pouchDB.delImpl = function (that, options, doc) {
        options = options || {};
        return that.pouch.remove(doc, options);
    };

})(jQuery, fluid);
