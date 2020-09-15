define([], function () {
    'use strict';
    var ERC777Properties = function () {
    };

    ERC777Properties.prototype.constructor = ERC777Properties;
    ERC777Properties.prototype.generateGlobalPExistence = function (templateOne, model, bipTransitionsToSMVNames, actionNamesToTransitionNames) {
        var self = this,
            properties = [],
            property, clause,
            propertiesSMV = '';

        properties = ERC777Properties.prototype.parseProperties.call(self, model, templateOne);
        for (property of properties) {
            propertiesSMV += '-- EF ( ';
            for (clause of property[0]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ')\n';

            propertiesSMV += 'CTLSPEC EF ( ';
            for (clause of property[0]) {
                propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ')\n\n';
        }
        return propertiesSMV;
    };

    /* Get the textual properties specified by the user in Template One */
    ERC777Properties.prototype.generateGlobalPExistenceText = function (templateOne, model, bipTransitionsToSMVNames, actionNamesToTransitionNames) {
        var self = this,
            properties = [],
            property, clause,
            propertiesSMV = '';

        properties = ERC777Properties.prototype.parseProperties.call(self, model, templateOne);
        for (property of properties) {
            propertiesSMV += '';
            for (clause of property[0]) {
                propertiesSMV += clause + "|"
            }

            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += 'should happen \n';

        }
        return propertiesSMV;
    };

    ERC777Properties.prototype.generateERC20TransferShouldThrowStrongProperty = function (templateOne, model, bipTransitionsToSMVNames, actionNamesToTransitionNames) {
        var self = this,
            properties = [],
            property, clause,
            propertiesSMV = '';

        properties = ERC777Properties.prototype.parseProperties.call(self, model, templateOne);
        for (property of properties) {
            propertiesSMV += '-- AG ( ';
            for (clause of property[1]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ' & !(';
            for (clause of property[2]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ')) -> A [ !(';
            for (clause of property[2]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ') U (';
            for (clause of property[0]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ' & !(';
            for (clause of property[2]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += '))]\n';

            propertiesSMV += 'CTLSPEC AG ( ';
            for (clause of property[1]) {
                propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ' & !(';
            for (clause of property[2]) {
                propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ')) -> A [ !(';
            for (clause of property[2]) {
                propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ') U (';
            for (clause of property[0]) {
                propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ' & !(';
            for (clause of property[2]) {
                propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += '))]\n\n';
        }
        console.log(propertiesSMV.toString());
        return propertiesSMV;
    };

    /* Get the textual properties specified by the user in Template One */
    ERC777Properties.prototype.generateERC20TransferShouldThrowPropertyText = function (templateOne, model, bipTransitionsToSMVNames, actionNamesToTransitionNames) {
        var self = this,
            properties = [],
            property, clause,
            propertiesSMV = '';

        properties = ERC777Properties.prototype.parseProperties.call(self, model, templateOne);
        for (property of properties) {
            propertiesSMV += '(';
            for (clause of property[0]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ') should happen between (';
            for (clause of property[1]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ') and (';
            for (clause of property[2]) {
                propertiesSMV += clause + "|"
            }
            propertiesSMV = propertiesSMV.slice(0, -1);
            propertiesSMV += ')\n';

        }
        return propertiesSMV;
    };


    ERC777Properties.prototype.parseProperties = function (model, properties) {
        var self = this,
            parsedProperties, clauses, actions,
            property, clause, action, actionName,
            transitions, transition;

        parsedProperties = [];
        for (property of properties.split(";")) {
            clauses = []; // collect all clauses for this property
            for (clause of property.split("#")) {
                actions = []; // collect all actions for this clause
                for (action of clause.split("|")) {
                    actionName = action.replace(/\s/g, ""); // all comparisons will be whitespace-agnostic
                    transitions = [];
                    for (transition of model["transitions"]) { // for each transition, check if it matches the action specification
                        // if(transition['actionName']!= undefined){
                        //   console.log('1 '+transition['actionName'].replace(/[;\s]+/g,""));
                        // }
                        // console.log('2 '+actionName);
                        if (transition['actionName'] != undefined && transition['actionName'].replace(/[;\s]+/g, "") === actionName) {
                            transitions.push(transition['actionName']);
                            //transitions.push(transition['actionName'].replace(/[;\s]+/g,""));
                        }
                    }
                    if (transitions.length != 1) {// action specification is ambiguous since multiple transitions match it
                        if (transitions.length == 0) {
                            throw "Could not find action: " + action + " Possible reason: Statement was specified without function name.";
                        }
                        throw "Ambiguous action (multiple instances occured): " + action;
                    }
                    actions.push(transitions[0]); // single transition matches the action specification
                }
                clauses.push(actions); // push this clause
            }
            parsedProperties.push(clauses); // push this property
        }
        return parsedProperties;
    };
    return ERC777Properties;
});