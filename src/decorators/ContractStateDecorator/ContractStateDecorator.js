
define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget',
    './PartBrowser/ContractStateDecorator.PartBrowserWidget'
], function (DecoratorBase, ContractStateDecoratorDiagramDesignerWidget, ContractStateDecoratorPartBrowserWidget) {

    'use strict';

    var ContractStateDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'ContractStateDecorator';

    ContractStateDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('ContractStateDecorator ctor');
    };

    _.extend(ContractStateDecorator.prototype, __parent_proto__);
    ContractStateDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    ContractStateDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: ContractStateDecoratorDiagramDesignerWidget,
            PartBrowser: ContractStateDecoratorPartBrowserWidget
        };
    };

    return ContractStateDecorator;
});
