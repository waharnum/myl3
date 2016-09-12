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
        },
        choiceTemplates: {
            "select-choice": "<option value='%choiceValue'>%choiceValue</option>",
            "radio-choice": "<label>%choiceValue</label><input class='floec-inferred-%inferredViewKey-value' name='%name' value='%choiceValue' type='radio' />"
        },
        wrapperTemplates: {
            "text": "<label class='floec-inferred-%inferredViewKey-label'>%label</label> <input class='floec-inferred-%inferredViewKey-value' type='text' value='%value' /><br/>",
            "select": "<label class='floec-inferred-%inferredViewKey-label'>%label</label> <select class='floec-inferred-%inferredViewKey-value'>%renderedChoices</select><br/>",
            "radio": "<fieldset><legend>%label</legend>%renderedChoices</fieldset> <br/>"
        }
    });

    floe.dashboard.inferredView.appendTemplate = function (that) {
        fluid.each(that.model.inferredViews, function (inferredViewValue, inferredViewKey) {
            var markup = floe.dashboard.inferredView.generateInferredMarkup(that, inferredViewValue, inferredViewKey);
            that.container.append(markup);
        });
    };

    floe.dashboard.inferredView.generateInferredMarkup = function (that, inferredViewValue, inferredViewKey ) {
        return floe.dashboard.inferredView.generateInferredMarkup[inferredViewValue.type](that, inferredViewValue, inferredViewKey );
    };

    floe.dashboard.inferredView.generateInferredMarkup.text = function (that, inferredViewValue, inferredViewKey ) {

        var template = that.options.wrapperTemplates["text"];

        return floe.dashboard.inferredView.getWrapperTemplate(template, inferredViewValue, inferredViewKey);
    };

    floe.dashboard.inferredView.generateInferredMarkup.select = function (that, inferredViewValue, inferredViewKey) {
        var renderedChoices = floe.dashboard.inferredView.getChoicesBlock(that,  "select", inferredViewValue, inferredViewKey);

        var template = that.options.wrapperTemplates["select"];

        var extraTemplateValues = {renderedChoices: renderedChoices};

        return floe.dashboard.inferredView.getWrapperTemplate(template, inferredViewValue, inferredViewKey, extraTemplateValues);
    };

    floe.dashboard.inferredView.generateInferredMarkup.radio = function (that, inferredViewValue, inferredViewKey) {
        var renderedChoices = floe.dashboard.inferredView.getChoicesBlock(that, "radio", inferredViewValue, inferredViewKey);

        var template = that.options.wrapperTemplates["radio"]

        var extraTemplateValues = {renderedChoices: renderedChoices};

        return floe.dashboard.inferredView.getWrapperTemplate(template, inferredViewValue, inferredViewKey, extraTemplateValues);
    };

    floe.dashboard.inferredView.getChoicesBlock = function(that, type, inferredViewValue, inferredViewKey) {
        var choiceTemplate = that.options.choiceTemplates[type + "-choice"];
        var renderedChoices = "";
        var name = type + "-" + fluid.allocateGuid();
        fluid.each(inferredViewValue.choices, function (choiceValue) {
            var extraChoiceTemplateValues = {name: name};
            renderedChoices = renderedChoices + floe.dashboard.inferredView.getChoiceTemplate(choiceTemplate, choiceValue, inferredViewValue, inferredViewKey, extraChoiceTemplateValues);
        });
        return renderedChoices;
    };

    floe.dashboard.inferredView.getChoiceTemplate = function (choiceTemplate, choiceValue, inferredViewValue, inferredViewKey, extraChoiceTemplateValues) {
        var baseChoiceTemplateValues = {choiceValue: choiceValue, inferredViewValue: inferredViewValue, inferredViewKey: inferredViewKey};

        var combinedTemplateValues = $.extend(baseChoiceTemplateValues, extraChoiceTemplateValues);

        return fluid.stringTemplate(choiceTemplate, combinedTemplateValues);
    };

    floe.dashboard.inferredView.getWrapperTemplate = function (template, inferredViewValue, inferredViewKey, extraTemplateValues) {
        var baseTemplate = {inferredViewKey: inferredViewKey, label: inferredViewValue.label, value: inferredViewValue.value};

        var combinedTemplateValues = $.extend(baseTemplate, extraTemplateValues);

        return fluid.stringTemplate(template, combinedTemplateValues);
    };

    // Automatically generates bindings and selectors from inferred views
    floe.dashboard.inferredView.generateBindingGrade = function (model) {
        var inferredViews = model[0].inferredViews;

        var gradeName = "floe.dashboard.inferredView." + fluid.allocateGuid();

        var bindings = {}, selectors = {};

        fluid.each(inferredViews, function (inferredViewValue, inferredViewKey) {
            var templateValues = {inferredViewKey: inferredViewKey};

            var selectorKey = fluid.stringTemplate("%inferredViewKey-value", templateValues);
            var selectorValue = fluid.stringTemplate(".floec-inferred-%inferredViewKey-value", templateValues);

            selectors[selectorKey] = selectorValue;

            var bindingKey = fluid.stringTemplate("%inferredViewKey-value", templateValues);
            var bindingValue = fluid.stringTemplate("inferredViews.%inferredViewKey.value", templateValues);

            bindings[bindingKey] = bindingValue;
        });

        fluid.defaults(gradeName, {
            bindings: bindings,
            selectors: selectors
        });

        return gradeName;
    };

})(jQuery, fluid);
