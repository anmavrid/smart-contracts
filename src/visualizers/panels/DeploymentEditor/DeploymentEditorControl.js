/*globals define, _, WebGMEGlobal, $ */
/*jshint browser: true */

define(['js/logger',
    'js/Constants',
    'js/NodePropertyNames',
    'js/RegistryKeys',
    'widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    //'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    './DeploymentEditorControl.DiagramDesignerWidgetEventHandlers',
    'js/Utils/GMEConcepts',
    'js/Utils/GMEVisualConcepts',
    'js/Utils/PreferencesHelper',
    'js/Controls/AlignMenu',
    'js/Utils/ComponentSettings'
], function (Logger,
             CONSTANTS,
             nodePropertyNames,
             REGISTRY_KEYS,
             DiagramDesignerWidgetConstants,
             DeploymentEditorControlDiagramDesignerWidgetEventHandlers,
             GMEConcepts,
             GMEVisualConcepts,
             PreferencesHelper,
             AlignMenu,
             ComponentSettings) {

    'use strict';

    var DeploymentEditorControl,
        BACKGROUND_TEXT_COLOR = '#DEDEDE',
        BACKGROUND_TEXT_SIZE = 30,
        DEFAULT_DECORATOR = 'ModelDecorator',
        WIDGET_NAME = 'DiagramDesigner',
        SRC_POINTER_NAME = CONSTANTS.POINTER_SOURCE,
        DST_POINTER_NAME = CONSTANTS.POINTER_TARGET;

    DeploymentEditorControl = function (options/*, config*/) {
        this.logger = options.logger || Logger.create(options.loggerName || 'gme:Panels:DeploymentEditor:' +
                'DeploymentEditorControl',
                WebGMEGlobal.gmeConfig.client.log);

        this._client = options.client;
        this._config = DeploymentEditorControl.getDefaultConfig();
        ComponentSettings.resolveWithWebGMEGlobal(this._config, DeploymentEditorControl.getComponentId());

        this._firstLoad = false;
        this._topNode = CONSTANTS.PROJECT_ROOT_ID;
        this._connectionManagerType = 'basic';

        //initialize core collections and variables
        this.designerCanvas = options.widget;
        this._alignMenu = new AlignMenu(this.designerCanvas.CONSTANTS, {});

        if (this._client === undefined) {
            this.logger.error('DeploymentEditorControl\'s client is not specified...');
            throw ('DeploymentEditorControl can not be created');
        }

        if (this.designerCanvas === undefined) {
            this.logger.error('DeploymentEditorControl\'s DesignerCanvas is not specified...');
            throw ('DeploymentEditorControl can not be created');
        }

        this._selfPatterns = {};

        // Alias just in case someone is extending this visualizers
        this._GMEID2ComponentID = this._GmeID2ComponentID = {};
        this._ComponentID2GMEID = this._ComponentID2GmeID = {};
        this.eventQueue = [];
        this._componentIDPartIDMap = {};

        //TODO: experiemtnal only, remove!!!
        this.___SLOW_CONN = false;

        //local variable holding info about the currently opened node
        this.currentNodeInfo = {id: null, children: [], parentId: null};

        /****************** END OF - ADD BUTTONS AND THEIR EVENT HANDLERS TO DESIGNER CANVAS ******************/

        //attach all the event handlers for event's coming from DesignerCanvas
        this.attachDiagramDesignerWidgetEventHandlers();

        //this._updateTopNode();
        this.logger.debug('DeploymentEditorControl ctor finished');
    };

    DeploymentEditorControl.prototype.selectedObjectChanged = function (nodeId) {
        var desc,
            nodeName,
            node,
            self = this;

        this.logger.debug('activeObject "' + nodeId + '"');

        //delete everything from model editor
        this.designerCanvas.clear();

        //clean up local hash map
        this._GMEModels = [];
        this._GMEConnections = [];

        // Alias just in case someone is extending this visualizers
        this._GMEID2ComponentID = this._GmeID2ComponentID = {};
        this._ComponentID2GMEID = this._ComponentID2GmeID = {};

        this._GMEID2Subcomponent = {};
        this._Subcomponent2GMEID = {};

        //remove current territory patterns
        if (this._territoryId) {
            this._client.removeUI(this._territoryId);
        }

        this.currentNodeInfo.id = nodeId;
        this.currentNodeInfo.parentId = undefined;

        this._delayedConnections = [];
        this._selectedAspect = WebGMEGlobal.State.getActiveAspect();

        //since PROJECT_ROOT_ID is an empty string, it is considered false..
        if (nodeId || nodeId === CONSTANTS.PROJECT_ROOT_ID) {
            desc = this._getObjectDescriptor(nodeId);
            nodeName = (desc && desc.name || ' ');
            if (desc) {
                this.currentNodeInfo.parentId = desc.parentId;
            }

            node = this._client.getNode(nodeId);

            if (this._selectedAspect !== CONSTANTS.ASPECT_ALL) {
                //make sure that the selectedAspect exist in the node, otherwise fallback to All
                var aspectNames = node ? node.getValidAspectNames() : [];
                if (aspectNames.indexOf(this._selectedAspect) === -1) {
                    this.logger.warn('The currently selected aspect "' + this._selectedAspect +
                        '" does not exist in the object "' + nodeName + ' (' + nodeId +
                        ')", falling back to "All"');
                    this._selectedAspect = CONSTANTS.ASPECT_ALL;
                    WebGMEGlobal.State.registerActiveAspect(CONSTANTS.ASPECT_ALL);
                }
            }

            //put new node's info into territory rules
            this._selfPatterns = {};

            if (this._selectedAspect === CONSTANTS.ASPECT_ALL) {
                this._selfPatterns[nodeId] = {children: 2};
            } else {
                this._selfPatterns[nodeId] = this._client.getAspectTerritoryPattern(nodeId, this._selectedAspect);
                this._selfPatterns[nodeId].children = 2;
            }

            this._firstLoad = true;

            this.designerCanvas.setTitle(nodeName);
            this.designerCanvas.setBackgroundText(nodeName, {
                'font-size': BACKGROUND_TEXT_SIZE,
                color: BACKGROUND_TEXT_COLOR
            });


            if (node && !this._client.isProjectReadOnly() && !this._client.isCommitReadOnly()) {
                this.designerCanvas.setReadOnly(node.isLibraryRoot() || node.isLibraryElement());
                this.setReadOnly(node.isLibraryRoot() || node.isLibraryElement());

                // Update the connection route-manager based on type..
                if (this.isOfMetaTypeName(node.getMetaTypeId(), 'Contract')) {
                    if (this._connectionManagerType !== 'basic') {
                        this.designerCanvas._onConnectionRouteManagerChanged('basic');
                        this._connectionManagerType = 'basic';
                    }
                } else if (this.isOfMetaTypeName(node.getMetaTypeId(), 'Contracts')) {
                    console.log('In contracts type');
                    if (this._connectionManagerType !== 'basic') {
                        this.designerCanvas._onConnectionRouteManagerChanged('basic');
                        this._connectionManagerType = 'basic';
                    }
                } else if (this._connectionManagerType !== 'basic3') {
                    this.designerCanvas._onConnectionRouteManagerChanged('basic3');
                    this._connectionManagerType = 'basic3';
                }
            }

            this.designerCanvas.showProgressbar();

            this._territoryId = this._client.addUI(this, function (events) {
                self._eventCallback(events);
            });
            //update the territory
            this._client.updateTerritory(this._territoryId, this._selfPatterns);
        } else {
            this.designerCanvas.setBackgroundText('No object to display', {
                color: BACKGROUND_TEXT_COLOR,
                'font-size': BACKGROUND_TEXT_SIZE
            });
        }
    };

    DeploymentEditorControl.prototype._getObjectDescriptor = function (nodeId) {
        var nodeObj = this._client.getNode(nodeId),
            objDescriptor,
            pos,
            defaultPos = 0,
            customPoints,
            memberListContainerObj;

        if (nodeObj) {
            objDescriptor = {};
            objDescriptor.id = nodeObj.getId();
            objDescriptor.name = nodeObj.getFullyQualifiedName();
            objDescriptor.parentId = nodeObj.getParentId();

            if (nodeObj.isLibraryRoot()) {
                //this means that a library root will not be visualized on our DeploymentEditor
                return objDescriptor;
            }

            if (nodeId !== this.currentNodeInfo.id) {
                //fill the descriptor based on its type
                objDescriptor.metaTypeId = nodeObj.getMetaTypeId();
                if (GMEConcepts.isConnection(nodeId)) {
                    objDescriptor.connectionChanged = this._GMEModels.indexOf(nodeId) > -1 &&
                        this._GMEConnections.indexOf(nodeId) === -1;

                    objDescriptor.kind = 'CONNECTION';
                    objDescriptor.source = nodeObj.getPointer(SRC_POINTER_NAME).to;
                    objDescriptor.target = nodeObj.getPointer(DST_POINTER_NAME).to;

                    //get all the other visual properties of the connection
                    _.extend(objDescriptor, GMEVisualConcepts.getConnectionVisualProperties(nodeId));

                    // If srcText or dstText is given -> remove the name.
                    if (objDescriptor.srcText || objDescriptor.dstText) {
                        delete objDescriptor.name;
                    }

                    if (this.isOfMetaTypeName(nodeObj.getMetaTypeId(), 'Transition')) {
                        objDescriptor.name = [nodeObj.getAttribute('name')];
                        if (nodeObj.getAttribute('guards')) {
                            objDescriptor.name.push('[' + nodeObj.getAttribute('guards') + ']');
                        }
                    }

                    //get custom points from the node object
                    customPoints = nodeObj.getRegistry(REGISTRY_KEYS.LINE_CUSTOM_POINTS);
                    if (customPoints && _.isArray(customPoints)) {
                        //JSON.parse(JSON.stringify(customPoints));
                        objDescriptor[CONSTANTS.LINE_STYLE.CUSTOM_POINTS] = $.extend(true, [], customPoints);
                    }
                } else {
                    objDescriptor.kind = 'MODEL';
                    objDescriptor.connectionChanged = this._GMEModels.indexOf(nodeId) === -1 &&
                        this._GMEConnections.indexOf(nodeId) > -1;

                    //aspect specific coordinate
                    if (this._selectedAspect === CONSTANTS.ASPECT_ALL) {
                        pos = nodeObj.getRegistry(REGISTRY_KEYS.POSITION);
                    } else {
                        memberListContainerObj = this._client.getNode(this.currentNodeInfo.id);
                        try {
                            pos = memberListContainerObj.getMemberRegistry(this._selectedAspect,
                                nodeId,
                                REGISTRY_KEYS.POSITION);
                        } catch (err) {
                            if (err.name !== 'CoreIllegalOperationError') {
                                throw err;
                            }
                        }

                        pos = pos || nodeObj.getRegistry(REGISTRY_KEYS.POSITION);
                    }

                    if (pos) {
                        objDescriptor.position = {x: pos.x, y: pos.y};
                    } else {
                        objDescriptor.position = {x: defaultPos, y: defaultPos};
                    }

                    if (objDescriptor.position.hasOwnProperty('x')) {
                        objDescriptor.position.x = this._getDefaultValueForNumber(objDescriptor.position.x, defaultPos);
                    } else {
                        objDescriptor.position.x = defaultPos;
                    }

                    if (objDescriptor.position.hasOwnProperty('y')) {
                        objDescriptor.position.y = this._getDefaultValueForNumber(objDescriptor.position.y, defaultPos);
                    } else {
                        objDescriptor.position.y = defaultPos;
                    }

                    objDescriptor.decorator = nodeObj.getRegistry(REGISTRY_KEYS.DECORATOR) || '';
                    objDescriptor.rotation = parseInt(nodeObj.getRegistry(REGISTRY_KEYS.ROTATION), 10) || 0;
                }
            }
        }

        return objDescriptor;
    };

    DeploymentEditorControl.prototype._getDefaultValueForNumber = function (cValue, defaultValue) {
        if (_.isNumber(cValue)) {
            if (_.isNaN(cValue)) {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }

        //cValue is a number, simply return it
        return cValue;
    };

    // PUBLIC METHODS
    DeploymentEditorControl.prototype._eventCallback = function (events) {
        var i = events ? events.length : 0,
            refresh;

        this.logger.debug('_eventCallback "' + i + '" items');

        if (i > 0) {
            this.eventQueue.push(events);
            refresh = this.processNextInQueue();
        }

        this.logger.debug('_eventCallback "' + events.length + '" items - DONE');
        if (refresh === true) {
            this.selectedObjectChanged(this.currentNodeInfo.id);
        }
    };

    DeploymentEditorControl.prototype.processNextInQueue = function () {
        var nextBatchInQueue,
            len = this.eventQueue.length,
            decoratorsToDownload = [DEFAULT_DECORATOR],
            itemDecorator,
            refresh = false,
            self = this;

        if (len > 0) {
            nextBatchInQueue = this.eventQueue.pop();

            len = nextBatchInQueue.length;

            while (len--) {
                if ((nextBatchInQueue[len].etype === CONSTANTS.TERRITORY_EVENT_LOAD) ||
                    (nextBatchInQueue[len].etype === CONSTANTS.TERRITORY_EVENT_UPDATE)) {

                    nextBatchInQueue[len].desc = this._getObjectDescriptor(nextBatchInQueue[len].eid);
                    refresh = refresh || nextBatchInQueue[len].desc.connectionChanged === true;

                    itemDecorator = nextBatchInQueue[len].desc.decorator;

                    if (itemDecorator && itemDecorator !== '') {
                        if (decoratorsToDownload.indexOf(itemDecorator) === -1) {
                            decoratorsToDownload.pushUnique(itemDecorator);
                        }
                    }
                }
            }

            this._client.decoratorManager.download(decoratorsToDownload, WIDGET_NAME, function () {
                self._dispatchEvents(nextBatchInQueue);
            });
        }

        return refresh;
    };

    DeploymentEditorControl.prototype._dispatchEvents = function (events) {
        var i = events.length,
            e,
            territoryChanged = false,
            self = this,
            orderedItemEvents,
            orderedConnectionEvents,
            connectorEnds,
            unloadEvents,
            objDesc,

            extraConnEndsUpdates = {},
            extraComponentTypeUpdates = {},
            handledEvents = {},

            srcGMEID,
            dstGMEID,
            srcConnIdx,
            dstConnIdx,
            j,
            ce,
            insertIdxAfter,
            insertIdxBefore,
            MAX_VAL = 999999999,
            depSrcConnIdx,
            depDstConnIdx;

        this.logger.debug('_dispatchEvents ' + events[0].etype);
        events.shift();

        this.logger.debug('_dispatchEvents "' + i + '" items');

        /********** ORDER EVENTS BASED ON DEPENDENCY ************/
        /** 1: items first, no dependency **/
        /** 2: ConnectorEnds - Trigger and Synchron **/
        /** 3: connections dependency if a connection is connected to an other connection **/
        orderedItemEvents = [];
        orderedConnectionEvents = [];
        connectorEnds = [];

        if (this._delayedConnections && this._delayedConnections.length > 0) {
            /*this.logger.warn('_delayedConnections: ' + this._delayedConnections.length );*/
            for (i = 0; i < this._delayedConnections.length; i += 1) {
                objDesc = this._getObjectDescriptor(this._delayedConnections[i]);
                if (objDesc) {
                    orderedConnectionEvents.push({
                        etype: CONSTANTS.TERRITORY_EVENT_LOAD,
                        eid: this._delayedConnections[i],
                        desc: objDesc
                    });
                } else {
                    // The connection was unloaded at this point..
                }
            }
        }

        this._delayedConnections = [];

        unloadEvents = [];
        i = events.length;
        while (i--) {
            e = events[i];
            handledEvents[e.eid] = true;

            if (e.etype === CONSTANTS.TERRITORY_EVENT_UNLOAD) {
                unloadEvents.push(e);
                 } else if (e.desc.kind === 'MODEL') {
                //     if (this.isOfMetaTypeName(e.desc.metaTypeId, 'ConnectorEnd')) {
                //         e.desc.metaTypeName = 'ConnectorEnd';
                //
                //         this.getConnectedComponentTypeFromConnectorEnd(e.desc).forEach(function (ctId) { // jshint ignore:line
                //             extraComponentTypeUpdates[ctId] = self._getObjectDescriptor(ctId);
                //
                //             // If the ComponentType changes -> all the associated ConnectorEnds may change too.
                //             self.getConnectedConnectorEndsFromComponentType(extraComponentTypeUpdates[ctId])
                //                 .forEach(function (ceId) {
                //                     var ceObjDesc = self._getObjectDescriptor(ceId);
                //                     ceObjDesc.metaTypeName = 'ConnectorEnd';
                //                     extraConnEndsUpdates[ceId] = ceObjDesc;
                //                 });
                //         });
                //
                //         connectorEnds.push(e);
                //     } else {
                //         if (this.isOfMetaTypeName(e.desc.metaTypeId, ['ComponentType', 'CompoundType'])) {
                //             this.getConnectedConnectorEndsFromComponentType(e.desc).forEach(function (ceId) { // jshint ignore:line
                //                 var ceObjDesc = self._getObjectDescriptor(ceId);
                //                 ceObjDesc.metaTypeName = 'ConnectorEnd';
                //                 extraConnEndsUpdates[ceId] = ceObjDesc;
                //             });
                //         }
                         orderedItemEvents.push(e);
            } else if (e.desc.kind === 'CONNECTION') {
                if (e.desc.parentId === this.currentNodeInfo.id) {
                    //check to see if SRC and DST is another connection
                    //if so, put this guy AFTER them
                    srcGMEID = e.desc.source;
                    dstGMEID = e.desc.target;
                    srcConnIdx = -1;
                    dstConnIdx = -1;
                    j = orderedConnectionEvents.length;
                    while (j--) {
                        ce = orderedConnectionEvents[j];
                        if (ce.id === srcGMEID) {
                            srcConnIdx = j;
                        } else if (ce.id === dstGMEID) {
                            dstConnIdx = j;
                        }

                        if (srcConnIdx !== -1 && dstConnIdx !== -1) {
                            break;
                        }
                    }

                    insertIdxAfter = Math.max(srcConnIdx, dstConnIdx);

                    //check to see if this guy is a DEPENDENT of any already processed CONNECTION
                    //insert BEFORE THEM
                    depSrcConnIdx = MAX_VAL;
                    depDstConnIdx = MAX_VAL;
                    j = orderedConnectionEvents.length;
                    while (j--) {
                        ce = orderedConnectionEvents[j];
                        if (e.desc.id === ce.desc.source) {
                            depSrcConnIdx = j;
                        } else if (e.desc.id === ce.desc.target) {
                            depDstConnIdx = j;
                        }

                        if (depSrcConnIdx !== MAX_VAL && depDstConnIdx !== MAX_VAL) {
                            break;
                        }
                    }

                    insertIdxBefore = Math.min(depSrcConnIdx, depDstConnIdx);
                    if (insertIdxAfter === -1 && insertIdxBefore === MAX_VAL) {
                        orderedConnectionEvents.push(e);
                    } else {
                        if (insertIdxAfter !== -1 &&
                            insertIdxBefore === MAX_VAL) {
                            orderedConnectionEvents.splice(insertIdxAfter + 1, 0, e);
                        } else if (insertIdxAfter === -1 &&
                            insertIdxBefore !== MAX_VAL) {
                            orderedConnectionEvents.splice(insertIdxBefore, 0, e);
                        } else if (insertIdxAfter !== -1 &&
                            insertIdxBefore !== MAX_VAL) {
                            orderedConnectionEvents.splice(insertIdxBefore, 0, e);
                        }
                    }
                } else {
                    orderedItemEvents.push(e);
                }

            } else if (this.currentNodeInfo.id === e.eid) {
                orderedItemEvents.push(e);
            }

        }

        // Regular models
        this._notifyPackage = {};
        this.designerCanvas.beginUpdate();
        events = unloadEvents.concat(orderedItemEvents);
        for (i = 0; i < events.length; i += 1) {
            e = events[i];
            switch (e.etype) {
                case CONSTANTS.TERRITORY_EVENT_LOAD:
                    territoryChanged = this._onLoad(e.eid, e.desc) || territoryChanged;
                    break;
                case CONSTANTS.TERRITORY_EVENT_UPDATE:
                    this._onUpdate(e.eid, e.desc);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                    territoryChanged = this._onUnload(e.eid) || territoryChanged;
                    break;
            }
        }

        // Handle the extra componentType events
        Object.keys(extraComponentTypeUpdates).forEach(function (eid) {
            if (!handledEvents[eid]) {
                self._onUpdate(eid, extraComponentTypeUpdates[eid]);
            }
        });

        this._handleDecoratorNotification();

        // ConnectorEnds
        events = connectorEnds;
        for (i = 0; i < events.length; i += 1) {
            e = events[i];
            switch (e.etype) {
                case CONSTANTS.TERRITORY_EVENT_LOAD:
                    territoryChanged = this._onLoad(e.eid, e.desc) || territoryChanged;
                    break;
                case CONSTANTS.TERRITORY_EVENT_UPDATE:
                    this._onUpdate(e.eid, e.desc);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                    territoryChanged = this._onUnload(e.eid) || territoryChanged;
                    break;
            }
        }

        // Handle the extra componentType events
        Object.keys(extraConnEndsUpdates).forEach(function (eid) {
            if (!handledEvents[eid]) {
                self._onUpdate(eid, extraConnEndsUpdates[eid]);
            }
        });

        //connections
        events = orderedConnectionEvents;
        for (i = 0; i < events.length; i += 1) {
            e = events[i];
            switch (e.etype) {
                case CONSTANTS.TERRITORY_EVENT_LOAD:
                    this._onLoad(e.eid, e.desc);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UPDATE:
                    this._onUpdate(e.eid, e.desc);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                    this._onUnload(e.eid);
                    break;
            }
        }

        this.designerCanvas.endUpdate();

        this.designerCanvas.hideProgressbar();

        //update the territory
        if (territoryChanged) {
            //TODO: review this async here
            if (this.___SLOW_CONN === true) {
                setTimeout(function () {
                    self.logger.debug('Updating territory with ruleset from decorators: ' +
                        JSON.stringify(self._selfPatterns));
                    self._client.updateTerritory(self._territoryId, self._selfPatterns);
                }, 2000);
            } else {
                this.logger.debug('Updating territory with ruleset from decorators: ' +
                    JSON.stringify(this._selfPatterns));
                this._client.updateTerritory(this._territoryId, this._selfPatterns);
            }
        }

        //check if firstload
        if (this._firstLoad === true) {
            this._firstLoad = false;

            //check if there is active selection set in client
            var activeSelection = WebGMEGlobal.State.getActiveSelection();

            if (activeSelection && activeSelection.length > 0) {
                i = activeSelection.length;
                var gmeID;
                var ddSelection = [];
                while (i--) {
                    //try to find each object present in the active selection mapped to DiagramDesigner element
                    gmeID = activeSelection[i];

                    if (this._GMEID2ComponentID[gmeID]) {
                        ddSelection = ddSelection.concat(this._GMEID2ComponentID[gmeID]);
                    }
                }

                this.designerCanvas.select(ddSelection);
            }
        }

        this.logger.debug('_dispatchEvents "' + events.length + '" items - DONE');

        //continue processing event queue
        this.processNextInQueue();
    };

    DeploymentEditorControl.prototype._getItemDecorator = function (decorator) {
        var result;

        result = this._client.decoratorManager.getDecoratorForWidget(decorator, WIDGET_NAME);

        if (!result) {
            result = this._client.decoratorManager.getDecoratorForWidget(DEFAULT_DECORATOR, WIDGET_NAME);
        }

        return result;
    };

    // PUBLIC METHODS
    DeploymentEditorControl.prototype._onLoad = function (gmeID, objD) {
        var uiComponent,
            decClass,
            objDesc,
            sources = [],
            destinations = [],
            getDecoratorTerritoryQueries,
            territoryChanged = false,
            self = this,
            connectorEndPos,
            srcDst,
            k,
            l;


        getDecoratorTerritoryQueries = function (decorator) {
            var query,
                entry;

            if (decorator) {
                query = decorator.getTerritoryQuery();

                if (query) {
                    for (entry in query) {
                        if (query.hasOwnProperty(entry)) {
                            self._selfPatterns[entry] = query[entry];
                            territoryChanged = true;
                        }
                    }
                }
            }
        };

        //component loaded
        //we are interested in the load of sub_components of the opened component
        if (this.currentNodeInfo.id !== gmeID) {
            if (objD) {
                if (objD.parentId === this.currentNodeInfo.id) {
                    objDesc = _.extend({}, objD);
                    this._GMEID2ComponentID[gmeID] = [];

                    if (objDesc.kind === 'MODEL') {

                        this._GMEModels.push(gmeID);

                        decClass = this._getItemDecorator(objDesc.decorator);

                        objDesc.decoratorClass = decClass;
                        objDesc.control = this;
                        objDesc.metaInfo = {};
                        objDesc.metaInfo[CONSTANTS.GME_ID] = gmeID;
                        objDesc.preferencesHelper = PreferencesHelper.getPreferences();
                        objDesc.aspect = this._selectedAspect;

                        // if (objDesc.metaTypeName === 'ConnectorEnd') {
                        //     connectorEndPos = this.getBIPConnectorEndPosition(objDesc);
                        //     if (connectorEndPos) {
                        //         objDesc.position.x = connectorEndPos.x;
                        //         objDesc.position.y = connectorEndPos.y;
                        //         objDesc.relativeOrientation = connectorEndPos.relativeOrientation;
                        //     }
                        // }

                        uiComponent = this.designerCanvas.createDesignerItem(objDesc);

                        this._GMEID2ComponentID[gmeID].push(uiComponent.id);
                        this._ComponentID2GMEID[uiComponent.id] = gmeID;

                        getDecoratorTerritoryQueries(uiComponent._decoratorInstance);
                    }

                    if (objDesc.kind === 'CONNECTION') {

                        this._GMEConnections.push(gmeID);

                        srcDst = this._getAllSourceDestinationPairsForConnection(objDesc.source, objDesc.target);
                        sources = srcDst.sources;
                        destinations = srcDst.destinations;

                        k = sources.length;
                        l = destinations.length;

                        if (k > 0 && l > 0) {
                            while (k--) {
                                while (l--) {
                                    objDesc.srcObjId = sources[k].objId;
                                    objDesc.srcSubCompId = sources[k].subCompId;
                                    objDesc.dstObjId = destinations[l].objId;
                                    objDesc.dstSubCompId = destinations[l].subCompId;
                                    objDesc.reconnectable = true;
                                    objDesc.editable = true;

                                    delete objDesc.source;
                                    delete objDesc.target;

                                    _.extend(objDesc, this.getConnectionDescriptor(gmeID));
                                    uiComponent = this.designerCanvas.createConnection(objDesc);

                                    this.logger.debug('Connection: ' + uiComponent.id + ' for GME object: ' +
                                        objDesc.id);

                                    this._GMEID2ComponentID[gmeID].push(uiComponent.id);
                                    this._ComponentID2GMEID[uiComponent.id] = gmeID;
                                }
                            }
                        } else {
                            //the connection is here, but no valid endpoint on canvas
                            //save the connection
                            this._delayedConnections.push(gmeID);
                        }
                    }
                } else {
                    //supposed to be the grandchild of the currently open node
                    //--> load of port
                    /*if(this._GMEModels.indexOf(objD.parentId) !== -1){
                     this._onUpdate(objD.parentId,this._getObjectDescriptor(objD.parentId));
                     }*/
                    this._checkComponentDependency(gmeID, CONSTANTS.TERRITORY_EVENT_LOAD);
                }
            }
        } else {
            //currently opened node
            this._updateSheetName(objD.name);
            this._updateAspects();
        }

        return territoryChanged;

    };

    DeploymentEditorControl.prototype._onUpdate = function (gmeID, objDesc) {
        var componentID,
            len,
            decClass,
            srcDst,
            sources,
            destinations,
            k,
            l,
            uiComponent,
            connectorEndPos;

        //self or child updated
        //check if the updated object is the opened node
        if (gmeID === this.currentNodeInfo.id) {
            //the updated object is the parent whose children are displayed here
            //the interest about the parent is:
            // - name change
            this._updateSheetName(objDesc.name);
            this._updateAspects();
        } else {
            if (objDesc) {
                if (objDesc.parentId === this.currentNodeInfo.id) {
                    if (objDesc.kind === 'MODEL') {
                        if (this._GMEID2ComponentID[gmeID]) {
                            len = this._GMEID2ComponentID[gmeID].length;
                            while (len--) {
                                componentID = this._GMEID2ComponentID[gmeID][len];

                                decClass = this._getItemDecorator(objDesc.decorator);

                                objDesc.decoratorClass = decClass;
                                objDesc.preferencesHelper = PreferencesHelper.getPreferences();
                                objDesc.aspect = this._selectedAspect;

                                // if (objDesc.metaTypeName === 'ConnectorEnd') {
                                //     connectorEndPos = this.getBIPConnectorEndPosition(objDesc);
                                //     if (connectorEndPos) {
                                //         objDesc.position.x = connectorEndPos.x;
                                //         objDesc.position.y = connectorEndPos.y;
                                //         objDesc.relativeOrientation = connectorEndPos.relativeOrientation;
                                //     }
                                // }

                                this.designerCanvas.updateDesignerItem(componentID, objDesc);
                            }
                        }
                    }

                    //there is a connection associated with this GMEID
                    if (this._GMEConnections.indexOf(gmeID) !== -1) {
                        len = this._GMEID2ComponentID[gmeID].length;
                        srcDst = this._getAllSourceDestinationPairsForConnection(objDesc.source, objDesc.target);
                        sources = srcDst.sources;
                        destinations = srcDst.destinations;

                        k = sources.length;
                        l = destinations.length;
                        len -= 1;

                        for (k = sources.length - 1; k >= 0; k -= 1) {
                            for (l = destinations.length - 1; l >= 0; l -= 1) {
                                objDesc.srcObjId = sources[k].objId;
                                objDesc.srcSubCompId = sources[k].subCompId;
                                objDesc.dstObjId = destinations[l].objId;
                                objDesc.dstSubCompId = destinations[l].subCompId;
                                objDesc.reconnectable = true;
                                objDesc.editable = true;

                                delete objDesc.source;
                                delete objDesc.target;

                                if (len >= 0) {
                                    componentID = this._GMEID2ComponentID[gmeID][len];

                                    _.extend(objDesc, this.getConnectionDescriptor(gmeID));
                                    this.designerCanvas.updateConnection(componentID, objDesc);

                                    len -= 1;
                                } else {
                                    this.logger.warn('Updating connections...Existing connections are less than the ' +
                                        'needed src-dst combo...');
                                    //let's create a connection
                                    _.extend(objDesc, this.getConnectionDescriptor(gmeID));
                                    uiComponent = this.designerCanvas.createConnection(objDesc);
                                    this.logger.debug('Connection: ' + uiComponent.id + ' for GME object: ' +
                                        objDesc.id);
                                    this._GMEID2ComponentID[gmeID].push(uiComponent.id);
                                    this._ComponentID2GMEID[uiComponent.id] = gmeID;
                                }
                            }
                        }

                        if (len >= 0) {
                            //some leftover connections on the widget
                            //delete them
                            len += 1;
                            while (len--) {
                                componentID = this._GMEID2ComponentID[gmeID][len];
                                this.designerCanvas.deleteComponent(componentID);
                                this._GMEID2ComponentID[gmeID].splice(len, 1);
                                delete this._ComponentID2GMEID[componentID];
                            }
                        }
                    }
                } else {
                    //update about a subcomponent - will be handled in the decorator
                    this._checkComponentDependency(gmeID, CONSTANTS.TERRITORY_EVENT_UPDATE);
                }
            }
        }
    };

    DeploymentEditorControl.prototype._updateSheetName = function (name) {
        this.designerCanvas.setTitle(name);
        this.designerCanvas.setBackgroundText(name, {
            'font-size': BACKGROUND_TEXT_SIZE,
            color: BACKGROUND_TEXT_COLOR
        });
    };

    DeploymentEditorControl.prototype._onUnload = function (gmeID) {
        var componentID,
            len,
            getDecoratorTerritoryQueries,
            self = this,
            territoryChanged = false;

        getDecoratorTerritoryQueries = function (decorator) {
            var query,
                entry;

            if (decorator) {
                query = decorator.getTerritoryQuery();

                if (query) {
                    for (entry in query) {
                        if (query.hasOwnProperty(entry)) {
                            delete self._selfPatterns[entry];
                            territoryChanged = true;
                        }
                    }
                }
            }
        };

        if (gmeID === this.currentNodeInfo.id) {
            //the opened model has been removed from territoy --> most likely deleted...
            this.logger.debug('The previously opened model does not exist... --- GMEID: "' + this.currentNodeInfo.id +
                '"');
            this.designerCanvas.setBackgroundText('The previously opened model does not exist...', {
                'font-size': BACKGROUND_TEXT_SIZE,
                color: BACKGROUND_TEXT_COLOR
            });
        } else {
            if (this._GMEID2ComponentID.hasOwnProperty(gmeID)) {
                len = this._GMEID2ComponentID[gmeID].length;
                while (len--) {
                    componentID = this._GMEID2ComponentID[gmeID][len];

                    if (this.designerCanvas.itemIds.indexOf(componentID) !== -1) {
                        getDecoratorTerritoryQueries(this.designerCanvas.items[componentID]._decoratorInstance);
                    }

                    this.designerCanvas.deleteComponent(componentID);

                    delete this._ComponentID2GMEID[componentID];
                }

                delete this._GMEID2ComponentID[gmeID];
            } else {
                //probably a subcomponent has been deleted - will be handled in the decorator
                this._checkComponentDependency(gmeID, CONSTANTS.TERRITORY_EVENT_UNLOAD);
            }
        }

        return territoryChanged;
    };

    //TODO: check this here...
    DeploymentEditorControl.prototype.destroy = function () {
        this._detachClientEventListeners();
        this._removeToolbarItems();
        this._client.removeUI(this._territoryId);
    };

    DeploymentEditorControl.prototype._removeConnectionSegmentPoints = function () {
        var idList = this.designerCanvas.selectionManager.getSelectedElements(),
            len = idList.length,
            nodeObj;

        this._client.startTransaction();

        while (len--) {
            if (this.designerCanvas.connectionIds.indexOf(idList[len]) !== -1) {
                nodeObj = this._client.getNode(this._ComponentID2GMEID[idList[len]]);

                if (nodeObj) {
                    this._client.delRegistry(nodeObj.getId(), REGISTRY_KEYS.LINE_CUSTOM_POINTS);
                }
            }
        }

        this._client.completeTransaction();
    };

    DeploymentEditorControl.prototype._getAllSourceDestinationPairsForConnection = function (GMESrcId, GMEDstId) {
        var sources = [],
            destinations = [],
            i;

        if (this._GMEID2ComponentID.hasOwnProperty(GMESrcId)) {
            //src is a DesignerItem
            i = this._GMEID2ComponentID[GMESrcId].length;
            while (i--) {
                sources.push({
                    objId: this._GMEID2ComponentID[GMESrcId][i],
                    subCompId: undefined
                });
            }
        } else {
            //src is not a DesignerItem
            //must be a sub_components somewhere, find the corresponding designerItem
            if (this._GMEID2Subcomponent && this._GMEID2Subcomponent.hasOwnProperty(GMESrcId)) {
                for (i in this._GMEID2Subcomponent[GMESrcId]) {
                    if (this._GMEID2Subcomponent[GMESrcId].hasOwnProperty(i)) {
                        sources.push({
                            objId: i,
                            subCompId: this._GMEID2Subcomponent[GMESrcId][i]
                        });
                    }
                }
            }
        }

        if (this._GMEID2ComponentID.hasOwnProperty(GMEDstId)) {
            i = this._GMEID2ComponentID[GMEDstId].length;
            while (i--) {
                destinations.push({
                    objId: this._GMEID2ComponentID[GMEDstId][i],
                    subCompId: undefined
                });
            }
        } else {
            //dst is not a DesignerItem
            //must be a sub_components somewhere, find the corresponding designerItem
            // // BIP: Do not render the connection
            // if (this._GMEID2Subcomponent && this._GMEID2Subcomponent.hasOwnProperty(GMEDstId)) {
            //     for (i in this._GMEID2Subcomponent[GMEDstId]) {
            //         if (this._GMEID2Subcomponent[GMEDstId].hasOwnProperty(i)) {
            //             destinations.push({
            //                 objId: i,
            //                 subCompId: this._GMEID2Subcomponent[GMEDstId][i]
            //             });
            //         }
            //     }
            // }
        }

        return {
            sources: sources,
            destinations: destinations
        };
    };

    DeploymentEditorControl.prototype.registerComponentIDForPartID = function (componentID, partId) {
        this._componentIDPartIDMap[componentID] = this._componentIDPartIDMap[componentID] || [];
        if (this._componentIDPartIDMap[componentID].indexOf(partId) === -1) {
            this._componentIDPartIDMap[componentID].push(partId);
        }
    };

    DeploymentEditorControl.prototype.unregisterComponentIDFromPartID = function (componentID, partId) {
        var idx;

        if (this._componentIDPartIDMap && this._componentIDPartIDMap[componentID]) {
            idx = this._componentIDPartIDMap[componentID].indexOf(partId);
            if (idx !== -1) {
                this._componentIDPartIDMap[componentID].splice(idx, 1);

                if (this._componentIDPartIDMap[componentID].length === 0) {
                    delete this._componentIDPartIDMap[componentID];
                }
            }
        }
    };

    DeploymentEditorControl.prototype._checkComponentDependency = function (gmeID, eventType) {
        var len;
        if (this._componentIDPartIDMap && this._componentIDPartIDMap[gmeID]) {
            len = this._componentIDPartIDMap[gmeID].length;
            while (len--) {
                this._notifyPackage[this._componentIDPartIDMap[gmeID][len]] =
                    this._notifyPackage[this._componentIDPartIDMap[gmeID][len]] || [];
                this._notifyPackage[this._componentIDPartIDMap[gmeID][len]].push({id: gmeID, event: eventType});
            }
        }
    };

    DeploymentEditorControl.prototype._handleDecoratorNotification = function () {
        var gmeID,
            i,
            itemID;

        for (gmeID in this._notifyPackage) {
            if (this._notifyPackage.hasOwnProperty(gmeID)) {
                this.logger.debug('NotifyPartDecorator: ' + gmeID + ', componentIDs: ' +
                    JSON.stringify(this._notifyPackage[gmeID]));

                if (this._GMEID2ComponentID.hasOwnProperty(gmeID)) {
                    //src is a DesignerItem
                    i = this._GMEID2ComponentID[gmeID].length;
                    while (i--) {
                        itemID = this._GMEID2ComponentID[gmeID][i];
                        this.designerCanvas.notifyItemComponentEvents(itemID, this._notifyPackage[gmeID]);
                    }
                }
            }
        }
    };

    DeploymentEditorControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this.currentNodeInfo && this.currentNodeInfo.id === activeObjectId) {
            // [patrik] added this check to avoid redrawing when becoming active in split panel mode.
            this.logger.debug('Disregarding activeObject changed when it is already the same.');
        } else {
            this.selectedObjectChanged(activeObjectId);
        }
    };

    DeploymentEditorControl.prototype._stateActiveSelectionChanged = function (model, activeSelection, opts) {
        var selectedIDs = [],
            len = activeSelection ? activeSelection.length : 0;

        if (opts.invoker !== this) {

            while (len--) {
                if (this._GMEID2ComponentID.hasOwnProperty(activeSelection[len])) {
                    selectedIDs = selectedIDs.concat(this._GMEID2ComponentID[activeSelection[len]]);
                }
            }

            this.designerCanvas.select(selectedIDs);
        }
    };

    DeploymentEditorControl.prototype._activeProjectChanged = function (/*model, activeProjectId*/) {
        //this._updateTopNode();
    };

    DeploymentEditorControl.prototype._updateTopNode = function () {
        var projectId = this._client.getActiveProjectId(),
            projectName,
            projectKind;

        if (projectId) {
            projectName = this._client.getActiveProjectName();
            projectKind = this._client.getActiveProjectKind();
            if (this._config.byProjectId.topNode.hasOwnProperty(projectId)) {
                this._topNode = this._config.byProjectId.topNode[projectId];
            } else if (this._config.byProjectName.topNode.hasOwnProperty(projectName)) {
                this._topNode = this._config.byProjectName.topNode[projectName];
            } else if (projectKind && this._config.byProjectKind.topNode.hasOwnProperty(projectKind)) {
                this._topNode = this._config.byProjectKind.topNode[projectKind];
            } else {
                this._topNode = this._config.topNode;
            }
        }
    };

    DeploymentEditorControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_SELECTION, this._stateActiveSelectionChanged, this);
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_PROJECT_NAME, this._activeProjectChanged, this);
    };

    DeploymentEditorControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_SELECTION, this._stateActiveSelectionChanged);
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_PROJECT_NAME, this._activeProjectChanged);
    };

    DeploymentEditorControl.prototype.onActivate = function () {
        this._attachClientEventListeners();
        this._displayToolbarItems();
        if (this._selectedAspect) {
            WebGMEGlobal.State.registerActiveAspect(this._selectedAspect);
        }

        if (this.currentNodeInfo && typeof this.currentNodeInfo.id === 'string') {
            WebGMEGlobal.State.registerActiveObject(this.currentNodeInfo.id, {suppressVisualizerFromNode: true});
        }
    };

    DeploymentEditorControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
        this._hideToolbarItems();
    };

    DeploymentEditorControl.prototype._displayToolbarItems = function () {
        if (this._toolbarInitialized !== true) {
            this._initializeToolbar();
        } else {
            for (var i = 0; i < this._toolbarItems.length; i++) {
                this._toolbarItems[i].show();
            }
        }
    };

    DeploymentEditorControl.prototype._hideToolbarItems = function () {
        if (this._toolbarInitialized === true) {
            for (var i = 0; i < this._toolbarItems.length; i++) {
                this._toolbarItems[i].hide();
            }
        }
    };

    DeploymentEditorControl.prototype._removeToolbarItems = function () {
        if (this._toolbarInitialized === true) {
            for (var i = 0; i < this._toolbarItems.length; i++) {
                this._toolbarItems[i].destroy();
            }
        }
    };

    DeploymentEditorControl.prototype._initializeToolbar = function () {
        var toolBar = WebGMEGlobal.Toolbar,
            self = this;

        this._toolbarItems = [];

        /****************** ADD BUTTONS AND THEIR EVENT HANDLERS TO DESIGNER CANVAS ******************/
        /************** REMOVE CONNECTION SEGMENTPOINTS BUTTON ****************/
        //TODO: This btn should probably be moved to the ContextMenu
        this.$btnConnectionRemoveSegmentPoints = toolBar.addButton(
            {
                title: 'Remove segment points',
                icon: 'glyphicon glyphicon-remove-circle',
                clickFn: function (/*data*/) {
                    self._removeConnectionSegmentPoints();
                }
            });
        this._toolbarItems.push(this.$btnConnectionRemoveSegmentPoints);
        this.$btnConnectionRemoveSegmentPoints.enabled(false);

        this._toolbarInitialized = true;
    };

    DeploymentEditorControl.prototype.getNodeID = function () {
        return this.currentNodeInfo.id;
    };


    DeploymentEditorControl.prototype._updateAspects = function () {
        var nodeId = this.currentNodeInfo.id,
            nodeObj = this._client.getNode(nodeId),
            aspects,
            tabID,
            i,
            selectedTabID,
            activePanel = WebGMEGlobal.PanelManager.getActivePanel();

        this._aspects = {};
        this.designerCanvas.clearTabs();

        // If the active panel isn't set (and the DeploymentEditor exists), assume
        // the DeploymentEditor is the active panel
        if (!activePanel || activePanel.control === this) {
            this._selectedAspect = WebGMEGlobal.State.getActiveAspect();
        }

        if (nodeId || nodeId === CONSTANTS.PROJECT_ROOT_ID) {
            aspects = nodeObj ? nodeObj.getValidAspectNames() : [];

            aspects.sort(function (a, b) {
                var an = a.toLowerCase(),
                    bn = b.toLowerCase();

                return (an < bn) ? -1 : 1;
            });

            aspects.splice(0, 0, CONSTANTS.ASPECT_ALL);

            this.designerCanvas.addMultipleTabsBegin();

            for (i = 0; i < aspects.length; i += 1) {
                tabID = this.designerCanvas.addTab(aspects[i]);

                this._aspects[tabID] = aspects[i];

                if (this._selectedAspect &&
                    this._selectedAspect === aspects[i]) {
                    selectedTabID = tabID;
                }
            }

            this.designerCanvas.addMultipleTabsEnd();
        }

        if (!selectedTabID) {
            for (selectedTabID in this._aspects) {
                if (this._aspects.hasOwnProperty(selectedTabID)) {
                    break;
                }
            }
        }

        this.designerCanvas.selectTab(selectedTabID.toString());

        //check if the node's aspect rules has changed or not, and if so, initialize with that
        if (this._selectedAspect !== CONSTANTS.ASPECT_ALL) {
            var newAspectRules = this._client.getAspectTerritoryPattern(nodeId, this._selectedAspect);
            var aspectRulesChanged = false;

            if (this._selfPatterns[nodeId].items && newAspectRules.items) {
                aspectRulesChanged = (_.difference(this._selfPatterns[nodeId].items, newAspectRules.items)).length > 0;
                if (aspectRulesChanged === false) {
                    aspectRulesChanged = (_.difference(newAspectRules.items, this._selfPatterns[nodeId].items)).length >
                        0;
                }
            } else {
                if (this._selfPatterns[nodeId].items || newAspectRules.items) {
                    //at least one has an item
                    aspectRulesChanged = true;
                }
            }

            if (aspectRulesChanged) {
                this.selectedObjectChanged(nodeId);
            }
        }
    };

    DeploymentEditorControl.prototype._initializeSelectedAspect = function (tabID) {
        WebGMEGlobal.State.registerActiveAspect(this._selectedAspect);
        WebGMEGlobal.State.registerActiveTab(tabID);

        this.selectedObjectChanged(this.currentNodeInfo.id);
    };

    DeploymentEditorControl.prototype.getConnectionDescriptor = function (/* gmeID */) {
        return {};
    };

    DeploymentEditorControl.prototype.isOfMetaTypeName = function (metaNodeId, metaTypeNames) {
        var metaNode = this._client.getNode(metaNodeId),
            baseId;

        metaTypeNames = metaTypeNames instanceof Array ? metaTypeNames : [metaTypeNames];

        while (metaNode) {
            if (metaTypeNames.indexOf(metaNode.getAttribute('name')) > -1) {
                return true;
            }

            baseId = metaNode.getBaseId();
            if (!baseId) {
                return false;
            }

            metaNode = this._client.getNode(baseId);
        }

        return false;
    };

    // DeploymentEditorControl.prototype.getConnectedComponentTypeFromConnectorEnd = function (objDesc, includeConns) {
    //     // This also includes CompoundTypes
    //     var self = this,
    //         connectorEndNode = this._client.getNode(objDesc.id),
    //         sources = connectorEndNode.getCollectionPaths('src'),
    //         result = [];
    //
    //     sources.forEach(function (connId) {
    //         var connectionNode = self._client.getNode(connId),
    //             transitionId,
    //             portNode,
    //             componentTypeNode;
    //
    //         if (connectionNode && self.isOfMetaTypeName(connectionNode.getMetaTypeId(), 'Connection')) {
    //             transitionId = connectionNode.getPointerId('dst');
    //             portNode = transitionId ? self._client.getNode(transitionId) : null;
    //             if (portNode &&
    //                 self.isOfMetaTypeName(portNode.getMetaTypeId(), ['EnforceableTransition', 'ExportPort'])) {
    //
    //                 componentTypeNode = self._client.getNode(portNode.getParentId());
    //                 if (componentTypeNode &&
    //                         // loosen this constraint s.t. moving of nodes includes the Conns
    //                     (componentTypeNode.getParentId() === self.currentNodeInfo.id || includeConns) &&
    //                     self.isOfMetaTypeName(componentTypeNode.getMetaTypeId(), ['ComponentType', 'CompoundType'])) {
    //
    //                     if (includeConns) {
    //                         result[componentTypeNode.getId()] = connectionNode.getId();
    //                     } else {
    //                         result.push(componentTypeNode.getId());
    //                     }
    //                 }
    //             }
    //         }
    //     });
    //
    //     return result;
    // };

    // DeploymentEditorControl.prototype.getConnectedConnectorEndsFromComponentType = function (objDesc) {
    //     var self = this,
    //         componentTypeNode = this._client.getNode(objDesc.id),
    //         childrenIds = componentTypeNode.getChildrenIds(),
    //         result = [];
    //
    //     childrenIds.forEach(function (enfTransId) {
    //         var enfTransNode = self._client.getNode(enfTransId);
    //         if (enfTransNode) {
    //             if (GMEConcepts.isPort(enfTransId) &&
    //                 self.isOfMetaTypeName(enfTransNode.getMetaTypeId(), ['EnforceableTransition', 'ExportPort'])) {
    //
    //                 enfTransNode.getCollectionPaths('dst').forEach(function (connectionId) {
    //                     var connNode = self._client.getNode(connectionId),
    //                         connEndNode;
    //
    //                     if (connNode &&
    //                         connNode.getParentId() === self.currentNodeInfo.id &&
    //                         connNode.getPointerId('src')) {
    //
    //                         connEndNode = self._client.getNode(connNode.getPointerId('src'));
    //                         if (self.isOfMetaTypeName(connEndNode.getMetaTypeId(), 'ConnectorEnd')) {
    //                             result.push(connEndNode.getId());
    //                         }
    //
    //                     } else {
    //                         self.logger.warn('connection not available', connectionId);
    //                     }
    //                 });
    //             }
    //         } else {
    //             self.logger.warn('Child not available', enfTransId);
    //         }
    //     });
    //
    //     return result;
    // };

    // DeploymentEditorControl.prototype.getBIPConnectorEndPosition = function (objDesc) {
    //     var self = this,
    //         connectorEndNode = this._client.getNode(objDesc.id),
    //         sources = connectorEndNode.getCollectionPaths('src'),
    //         result;
    //
    //     sources.forEach(function (connId) {
    //         var connectionNode = self._client.getNode(connId),
    //             decorator,
    //             transitionId,
    //             portNode,
    //             componentTypeItemId,
    //             componentTypeNode;
    //
    //         if (connectionNode && self.isOfMetaTypeName(connectionNode.getMetaTypeId(), 'Connection')) {
    //             transitionId = connectionNode.getPointerId('dst');
    //             portNode = transitionId ? self._client.getNode(transitionId) : null;
    //             if (portNode &&
    //                 self.isOfMetaTypeName(portNode.getMetaTypeId(), ['EnforceableTransition', 'ExportPort'])) {
    //
    //                 componentTypeNode = self._client.getNode(portNode.getParentId());
    //                 if (componentTypeNode &&
    //                     componentTypeNode.getParentId() === self.currentNodeInfo.id &&
    //                     self.isOfMetaTypeName(componentTypeNode.getMetaTypeId(), ['ComponentType', 'CompoundType'])) {
    //
    //                     componentTypeItemId = self._GMEID2ComponentID[componentTypeNode.getId()] &&
    //                         self._GMEID2ComponentID[componentTypeNode.getId()][0];
    //
    //                     decorator = componentTypeItemId && self.designerCanvas.items[componentTypeItemId]
    //                             ._decoratorInstance;
    //
    //                     if (decorator && typeof decorator.getConnectorEndPosition === 'function') {
    //                         result = decorator.getConnectorEndPosition(transitionId, connectorEndNode.getId());
    //                     }
    //                 }
    //             }
    //         }
    //     });
    //
    //     return result;
    // };

    // DeploymentEditorControl.prototype.getInferredConnections = function (gmeIDs) {
    //     var self = this,
    //         currentNode = self._client.getNode(this.currentNodeInfo.id),
    //         connIds = [];
    //     if (currentNode &&
    //         self.isOfMetaTypeName(currentNode.getMetaTypeId(), ['Project', 'CompoundType']) &&
    //         gmeIDs.length >= 2) {
    //
    //         self.logger.debug('More than two selected objects will check for inferred Connection-types');
    //         gmeIDs.forEach(function (id) {
    //             var nodeObj = self._client.getNode(id),
    //                 res;
    //             // First get all selected "ConnectorEnd"-s
    //             if (nodeObj && self.isOfMetaTypeName(nodeObj.getMetaTypeId(), 'ConnectorEnd')) {
    //                 res = self.getConnectedComponentTypeFromConnectorEnd({id: id}, true);
    //                 self.logger.debug('ConnectorEnd is connected via', res);
    //                 Object.keys(res).forEach(function (componentId) {
    //                     if (gmeIDs.indexOf(componentId) > -1 && connIds.indexOf(res[componentId]) === -1) {
    //                         connIds.push(res[componentId]);
    //                     }
    //                 });
    //             }
    //         });
    //
    //         self.logger.debug('Adding inferred Connections', connIds);
    //
    //     }
    //
    //     return connIds;
    // };

    DeploymentEditorControl.getDefaultConfig = function () {
        return {
            topNode: '',
            byProjectKind: {
                topNode: {}
            },
            byProjectName: {
                topNode: {}
            },
            byProjectId: {
                topNode: {}
            }
        };
    };

    DeploymentEditorControl.getComponentId = function () {
        return 'GenericUIDeploymentEditorControl';
    };

    //attach DeploymentEditorControl - DesignerCanvas event handler functions
    _.extend(DeploymentEditorControl.prototype, DeploymentEditorControlDiagramDesignerWidgetEventHandlers.prototype);

    return DeploymentEditorControl;
});
