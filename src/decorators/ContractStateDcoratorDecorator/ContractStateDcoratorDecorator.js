/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/ContractStateDcoratorDecorator.DiagramDesignerWidget',
    './PartBrowser/ContractStateDcoratorDecorator.PartBrowserWidget'
], function (DecoratorBase, ContractStateDcoratorDecoratorDiagramDesignerWidget, ContractStateDcoratorDecoratorPartBrowserWidget) {

    'use strict';

    var ContractStateDcoratorDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'ContractStateDcoratorDecorator';

    ContractStateDcoratorDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('ContractStateDcoratorDecorator ctor');
    };

    _.extend(ContractStateDcoratorDecorator.prototype, __parent_proto__);
    ContractStateDcoratorDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    ContractStateDcoratorDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: ContractStateDcoratorDecoratorDiagramDesignerWidget,
            PartBrowser: ContractStateDcoratorDecoratorPartBrowserWidget
        };
    };

    return ContractStateDcoratorDecorator;
});