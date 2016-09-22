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

    fluid.defaults("floe.dashboard.inferredView.editable", {
        gradeNames: ["fluid.viewComponent"],
        // model: {
        //     inferredViews: {
        //         name: {
        //             label: "What are you called?",
        //             value: "William",
        //             type: "text"
        //         },
        //         neighbourhood: {
        //             label: "Which Toronto neighbourhoods have you lived in?",
        //             value: ["Upper Beaches", "Annex"],
        //             type: "checkbox",
        //             choices: ["Upper Beaches", "Annex", "High Park Village"]
        //         }
        //     }
        // },
        selectors: {
            editable: ".floec-editable",
            displayedInferredView: ".floec-displayedInferredView"
        },
        events: {
            "ondisplayedInferredViewReady": null
        },
        dynamicComponents: {
            displayedInferredView: {
                type: "floe.dashboard.inferredView",
                container: "{that}.dom.displayedInferredView",
                createOnEvent: "{editable}.events.onCreate",
                options: {
                    model: {
                        inferredViews: "{editable}.model.inferredViews"
                    },
                    listeners: {
                        "onBindingsApplied.escalate": "{editable}.events.ondisplayedInferredViewReady.fire"
                    },
                    modelListeners: {
                        "redoPreview": {
                            "path": "inferredViews",
                            "funcName": "floe.dashboard.inferredView.appendModelGeneratedTemplate",
                            "args": ["{that}", true],
                            excludeSource: "init"
                        }
                    }
                }
            },
            editor: {
                type: "floe.dashboard.inferredView.editor",
                container: "{that}.dom.editable",
                createOnEvent: "{editable}.events.ondisplayedInferredViewReady",
                options: {
                    inferredViewsToEdit: "{displayedInferredView}.model.inferredViews"
                }
            }
        }
    });

    fluid.defaults("floe.dashboard.inferredView.editor", {
        gradeNames: ["{that}.getEditorGrade", "floe.dashboard.inferredView"],
        // inferredViewKey: "name"
        // inferredViewsToEdit:
        invokers: {
            "getEditorGrade": {
                "funcName": "floe.dashboard.inferredView.editable.getEditorGrade",
                "args": ["{that}.options.inferredViewKey", "{that}.options.inferredViewsToEdit"]
            }
        }
    });

    floe.dashboard.inferredView.editor.getInputTypeForDefaultValue = function (type) {
        if (type === "select" || type === "radio") {
            return "select";
        } else if (type === "checkbox") {
            return "checkbox";
        } else {
            return "text";
        }
    };

    floe.dashboard.inferredView.editor.getInferredViewForEditable = function (inferredViewDefinitionValue, inferredViewDefinitionKey, type, modelRelaydisplayedInferredView) {

        console.log(inferredViewDefinitionKey, inferredViewDefinitionValue, type);
        // label - always free text
        if(inferredViewDefinitionKey === "label") {
            console.log("Label case");
            return {
                label: "Label",
                value: modelRelaydisplayedInferredView + ".label",
                type: "text"
            };
        }

        // value - free text, checkbox or select, depending
        if(inferredViewDefinitionKey === "value") {
            console.log("Value case");
            return {
                label: "Default Value",
                value: modelRelaydisplayedInferredView + ".value",
                type: floe.dashboard.inferredView.editor.getInputTypeForDefaultValue(type),
                choices: modelRelaydisplayedInferredView + ".choices"
            };
        }

        // type - from types
        if(inferredViewDefinitionKey === "type") {
            console.log("Type case");
            return {
                label: "Type",
                value: modelRelaydisplayedInferredView + ".type",
                type: "select",
                choices: {
                    expander: {
                        funcName: "floe.dashboard.inferredView.editable.getAvailableTypes",
                        args: ["{that}.options.stringTemplates.values"]
                    }
                }
            };
        }

        // choices - if from a choice type
        if(inferredViewDefinitionKey === "choices") {
            console.log("Choices case");
            return {
                label: "Choices",
                type: "textarea"
            };
        }

    };

    floe.dashboard.inferredView.editor.getChoicesRelayForEditable = function (inferredViewKey, type, modelRelaydisplayedInferredView, modelPath) {
        var relayBlock = {};

        relayBlock[inferredViewKey + "-choicesEdit"] = {
            target: modelRelaydisplayedInferredView + ".choices",
            singleTransform: {
                input: "{editor}.model.inferredViews." + inferredViewKey + "-choices.value",
                type: "fluid.transforms.free",
                func: "floe.dashboard.inferredView.editable.relayChoicesChange",
                args: ["{displayedInferredView}", "{editor}.model.inferredViews." + inferredViewKey + "-choices.value", modelPath]
            },
            forward: {
                excludeSource: "init"
            },
            backward: {
                excludeSource: "*"
            }
        };

        relayBlock[inferredViewKey + "-choicesInit"] = {
            target: "{editor}.model.inferredViews." + inferredViewKey + "-choices.value",
            singleTransform: {
                input: modelRelaydisplayedInferredView + ".choices",
                type: "fluid.transforms.literalValue"
            },
            forward: {
                includeSource: "init"
            },
            backward: {
                excludeSource: "init"
            }
        };

        return relayBlock;
    };

    floe.dashboard.inferredView.editable.getEditorGrade = function (inferredViewKey, inferredViewsToEdit) {
        console.log(inferredViewsToEdit);

        var gradeName = "floe.dashboard.inferredView.editorGrade-" + fluid.allocateGuid();

        var newModelBlock = {};

        var newModelRelayBlock = {};

        fluid.each(inferredViewsToEdit, function (inferredViewDefinition, inferredViewKey) {
            var modelRelaydisplayedInferredView = "{displayedInferredView}.model.inferredViews." + inferredViewKey;
            var modelPath = "inferredViews." + inferredViewKey;
            var type = inferredViewDefinition.type;

            fluid.each(inferredViewDefinition, function (inferredViewDefinitionValue, inferredViewDefinitionKey) {
                var block = floe.dashboard.inferredView.editor.getInferredViewForEditable(inferredViewDefinitionValue, inferredViewDefinitionKey, type, modelRelaydisplayedInferredView);
                newModelBlock[inferredViewKey + "-" + inferredViewDefinitionKey] = block;
            });

            if (inferredViewDefinition.choices) {
                var block = floe.dashboard.inferredView.editor.getChoicesRelayForEditable(inferredViewKey, type, modelRelaydisplayedInferredView, modelPath);
                $.extend(true, newModelRelayBlock, block);
            }

            console.log(newModelRelayBlock);

        });

        var editorBlock = {
            model: {
                inferredViews: newModelBlock
            },
            modelRelay: newModelRelayBlock
        };

        fluid.defaults(gradeName, editorBlock);

        return gradeName;
    };

    floe.dashboard.inferredView.editable.getAvailableTypes = function (valueTypes) {
        var filteredTypes = fluid.remove_if(fluid.copy(valueTypes), function (valueType, valueKey) {
            return (valueKey.indexOf("-default") > -1);
        });
        return fluid.keys(filteredTypes);
    };

    floe.dashboard.inferredView.editable.relayChoicesChange = function (displayedInferredView, choicesChange, modelPath) {
        console.log(displayedInferredView, choicesChange);
        displayedInferredView.applier.change(modelPath + ".choices", choicesChange.split(","));
    };

})(jQuery, fluid);
