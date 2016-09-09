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

    // A grade that can automatically generate a view based on the supplied
    // model definition, and generate bindings between it and the model
    fluid.defaults("floe.dashboard.inferredView", {
        gradeNames: ["{that}.generateBindingGrade", "fluid.viewComponent"],
        listeners: {
            "onCreate.appendTemplate": {
                funcName: "floe.dashboard.inferredView.appendTemplate",
                args: ["{that}"]
            },
            "onCreate.applyBindings": {
                "funcName": "gpii.binder.applyBinding",
                args: ["{that}"],
                priority: "after:appendTemplate"
            }
        },
        invokers: {
            "generateBindingGrade": {
                funcName: "floe.dashboard.inferredView.generateBindingGrade",
                args: ["{that}.options.model"]
            }
        }
    });

    floe.dashboard.inferredView.appendTemplate = function (that) {
        fluid.each(that.model.inferredViews, function (inferredViewValue, inferredViewKey) {
            var markup = floe.dashboard.inferredView.generateInferredMarkup(inferredViewValue, inferredViewKey);
            that.container.append(markup);
        });
    };

    floe.dashboard.inferredView.generateInferredMarkup = function (inferredViewValue, inferredViewkey) {
        // console.log(inferredViewValue, inferredViewkey);
        var type = inferredViewValue.type;
        return floe.dashboard.inferredView.generateInferredMarkup[type](inferredViewValue, inferredViewkey);
    };

    floe.dashboard.inferredView.generateInferredMarkup.free = function (inferredViewValue, inferredViewkey) {

        var template = "<label class='floec-inferred-%key-label'>%label</label> <input class='floec-inferred-%key-value' type='text' value='%value' /><br/>";

        var templateValues = {key: inferredViewkey, label: inferredViewValue.label, value: inferredViewValue.value};

        return fluid.stringTemplate(template, templateValues);
    };

    floe.dashboard.inferredView.generateInferredMarkup.select = function (inferredViewValue, inferredViewkey) {

        var optionTemplate = "<option value='%optionValue'>%optionValue</option>";
        var renderedOptions = "";
        fluid.each(inferredViewValue.options, function (optionValue) {
            var templateValues = {optionValue: optionValue};
            renderedOptions = renderedOptions + fluid.stringTemplate(optionTemplate, templateValues);
        });

        var template = "<label class='floec-inferred-%key-label'>%label</label> <select class='floec-inferred-%key-value'>%renderedOptions</select><br/>";

        var templateValues = {key: inferredViewkey, label: inferredViewValue.label, value: inferredViewValue.value, renderedOptions: renderedOptions};

        return fluid.stringTemplate(template, templateValues);
    };

    floe.dashboard.inferredView.generateInferredMarkup.radio = function (inferredViewValue, inferredViewkey) {

        var radioTemplate = "<label>%optionValue</label><input class='floec-inferred-%key-value' name='%radioName' value='%optionValue' type='radio' />";
        var renderedRadios = "";
        var radioName = "radio-" + fluid.allocateGuid();
        fluid.each(inferredViewValue.options, function (optionValue) {
            var templateValues = {optionValue: optionValue, key: inferredViewkey, radioName: radioName};
            renderedRadios = renderedRadios + fluid.stringTemplate(radioTemplate, templateValues);
        });

        var template = "<fieldset><legend>%label</legend>%renderedRadios</fieldset> <br/>";

        var templateValues = {key: inferredViewkey, label: inferredViewValue.label, value: inferredViewValue.value, renderedRadios: renderedRadios};

        return fluid.stringTemplate(template, templateValues);
    };

    // Automatically generates bindings and selectors from inferred views
    floe.dashboard.inferredView.generateBindingGrade = function (model) {
        var inferredViews = model[0].inferredViews;

        var gradeName = "floe.dashboard.inferredView." + fluid.allocateGuid();

        var bindings = {}, selectors = {};

        fluid.each(inferredViews, function (inferredViewValue, inferredViewKey) {

            var templateValues = {key: inferredViewKey};

            var selectorKey = fluid.stringTemplate("%key-value", templateValues);
            var selectorValue = fluid.stringTemplate(".floec-inferred-%key-value", templateValues);

            selectors[selectorKey] = selectorValue;

            var bindingKey = fluid.stringTemplate("%key-value", templateValues);
            var bindingValue = fluid.stringTemplate("inferredViews.%key.value", templateValues);

            bindings[bindingKey] = bindingValue;
        });

        fluid.defaults(gradeName, {
            bindings: bindings,
            selectors: selectors
        });

        return gradeName;
    };

})(jQuery, fluid);
