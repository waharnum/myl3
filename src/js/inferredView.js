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
            "checkbox-choice": "<label>%choiceValue</label><input class='floec-inferred-%inferredViewKey-value' name='%name' value='%choiceValue' type='checkbox' />",

            "select-choice": "<option value='%choiceValue'>%choiceValue</option>",

            "radio-choice": "<label>%choiceValue</label><input class='floec-inferred-%inferredViewKey-value' name='%name' value='%choiceValue' type='radio' />"
        },
        wrapperTemplates: {
            "checkbox":  "<fieldset><legend>%label</legend>%renderedChoices</fieldset> ",

            "text": "<label class='floec-inferred-%inferredViewKey-label'>%label</label> <input class='floec-inferred-%inferredViewKey-value' type='text' value='%value' />",

            "select": "<label class='floec-inferred-%inferredViewKey-label'>%label</label> <select class='floec-inferred-%inferredViewKey-value'>%renderedChoices</select>",

            "radio": "<fieldset><legend>%label</legend>%renderedChoices</fieldset> "
        }
    });

    floe.dashboard.inferredView.appendTemplate = function (that) {
        fluid.each(that.model.inferredViews, function (inferredViewValue, inferredViewKey) {
            var markup = floe.dashboard.inferredView.generateInferredMarkup(that, inferredViewValue, inferredViewKey);
            that.container.append(markup);
        });
    };

    floe.dashboard.inferredView.generateInferredMarkup = function (that, inferredViewValue, inferredViewKey ) {
        var extraTemplateValues = {};
        if(inferredViewValue.choices) {

            var renderedChoices = floe.dashboard.inferredView.getChoicesBlock(that,  inferredViewValue.type, inferredViewValue, inferredViewKey);

            extraTemplateValues = {renderedChoices: renderedChoices};
        }
        var template = that.options.wrapperTemplates[inferredViewValue.type];

        return floe.dashboard.inferredView.getWrapperTemplate(template, inferredViewValue, inferredViewKey, extraTemplateValues);
    };

    floe.dashboard.inferredView.getChoicesBlock = function (that, type, inferredViewValue, inferredViewKey) {
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

            var selectorClass = fluid.stringTemplate(".floec-inferred-%inferredViewKey-value", templateValues);

            var bindingPath = fluid.stringTemplate("inferredViews.%inferredViewKey.value", templateValues);

            selectors[selectorKey] = selectorClass;
            bindings[selectorKey] = {selector: selectorKey, path: bindingPath};
        });

        fluid.defaults(gradeName, {
            bindings: bindings,
            selectors: selectors
        });

        return gradeName;
    };

})(jQuery, fluid);
