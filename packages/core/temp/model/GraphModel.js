var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { action, observable, computed } from 'mobx';
import { map } from 'lodash-es';
import EditConfigModel from './EditConfigModel';
import TransfromModel from './TransformModel';
import { ElementState, ModelType, EventType, ElementMaxzIndex, ElementType, OverlapMode, } from '../constant/constant';
import { updateTheme } from '../util/theme';
import EventEmitter from '../event/eventEmitter';
import { snapToGrid, getGridOffset } from '../util/geometry';
import { isPointInArea } from '../util/graph';
import { getClosestPointOfPolyline, createEdgeGenerator } from '../util/edge';
import { formatData } from '../util/compatible';
import { getNodeAnchorPosition, getNodeBBox } from '../util/node';
import { createUuid } from '../util';
import { getMinIndex, getZIndex } from '../util/zIndex';
import { updateAnimation } from '../util/animation';
var VisibleMoreSpace = 200;
var GraphModel = /** @class */ (function () {
    function GraphModel(options) {
        /**
         * 维护所有节点和边类型对应的model
         */
        this.modelMap = new Map();
        /**
         * 节点移动规则判断
         * 在节点移动的时候，会出发此数组中的所有规则判断
         */
        this.nodeMoveRules = [];
        /**
         * 当前图上所有节点的model
         */
        this.nodes = [];
        /**
         * 当前图上所有边的model
         */
        this.edges = [];
        /**
         * 元素重合时堆叠模式
         * 默认模式，节点和边被选中，会被显示在最上面。当取消选中后，元素会恢复之前的层级。
         * 递增模式，节点和边被选中，会被显示在最上面。当取消选中后，元素会保持层级。
         * @see todo link
         */
        this.overlapMode = OverlapMode.DEFAULT;
        /**
         * 网格大小
         * @see todo link
         */
        this.gridSize = 1;
        /**
         * 局部渲染
         * @see todo logicflow性能
         */
        this.partial = false;
        var container = options.container, _a = options.background, background = _a === void 0 ? {} : _a, grid = options.grid, idGenerator = options.idGenerator, edgeGenerator = options.edgeGenerator, animation = options.animation;
        this.background = background;
        if (typeof grid === 'object') {
            this.gridSize = grid.size;
        }
        this.rootEl = container;
        this.editConfigModel = new EditConfigModel(options);
        this.eventCenter = new EventEmitter();
        this.transformModel = new TransfromModel(this.eventCenter);
        this.theme = updateTheme(options.style);
        this.edgeType = options.edgeType || 'polyline';
        this.width = options.width;
        this.height = options.height;
        this.animation = updateAnimation(animation);
        this.partial = options.partial;
        this.overlapMode = options.overlapMode || 0;
        this.idGenerator = idGenerator;
        this.edgeGenerator = createEdgeGenerator(this, edgeGenerator);
        this.width = options.width || this.rootEl.getBoundingClientRect().width;
        this.height = options.height || this.rootEl.getBoundingClientRect().height;
    }
    Object.defineProperty(GraphModel.prototype, "nodesMap", {
        get: function () {
            return this.nodes.reduce(function (nMap, model, index) {
                nMap[model.id] = { index: index, model: model };
                return nMap;
            }, {});
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphModel.prototype, "edgesMap", {
        get: function () {
            return this.edges.reduce(function (eMap, model, index) {
                eMap[model.id] = { index: index, model: model };
                return eMap;
            }, {});
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphModel.prototype, "modelsMap", {
        get: function () {
            return __spread(this.nodes, this.edges).reduce(function (eMap, model) {
                eMap[model.id] = model;
                return eMap;
            }, {});
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphModel.prototype, "sortElements", {
        /**
         * 基于zIndex对元素进行排序。
         * todo: 性能优化
         */
        get: function () {
            var elements = [];
            this.nodes.forEach(function (node) { return elements.push(node); });
            this.edges.forEach(function (edge) { return elements.push(edge); });
            elements = elements.sort(function (a, b) { return a.zIndex - b.zIndex; });
            // 只显示可见区域的节点和边
            var showElements = [];
            var topElementIdx = -1;
            // todo: 缓存, 优化计算效率
            var visibleLt = [-VisibleMoreSpace, -VisibleMoreSpace];
            var visibleRb = [this.width + VisibleMoreSpace, this.height + VisibleMoreSpace];
            for (var i = 0; i < elements.length; i++) {
                var currentItem = elements[i];
                // 如果节点不在可见区域，且不是全元素显示模式，则隐藏节点。
                if (currentItem.visible
                    && (!this.partial
                        || currentItem.isSelected
                        || this.isElementInArea(currentItem, visibleLt, visibleRb, false, false))) {
                    if (currentItem.zIndex === ElementMaxzIndex) {
                        topElementIdx = showElements.length;
                    }
                    showElements.push(currentItem);
                }
            }
            if (topElementIdx !== -1) {
                var lastElement = showElements[showElements.length - 1];
                showElements[showElements.length - 1] = showElements[topElementIdx];
                showElements[topElementIdx] = lastElement;
            }
            return showElements;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphModel.prototype, "textEditElement", {
        /**
         * 当前编辑的元素，低频操作，先循环找。
         */
        get: function () {
            var textEditNode = this.nodes.find(function (node) { return node.state === ElementState.TEXT_EDIT; });
            var textEditEdge = this.edges.find(function (edge) { return edge.state === ElementState.TEXT_EDIT; });
            return textEditNode || textEditEdge;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphModel.prototype, "selectElements", {
        /**
         * 当前画布所有被选中的元素
         */
        get: function () {
            var elements = new Map();
            this.nodes.forEach(function (node) {
                if (node.isSelected) {
                    elements.set(node.id, node);
                }
            });
            this.edges.forEach(function (edge) {
                if (edge.isSelected) {
                    elements.set(edge.id, edge);
                }
            });
            return elements;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 获取指定区域内的所有元素
     * @param leftTopPoint 表示区域左上角的点
     * @param rightBottomPoint 表示区域右下角的点
     * @param wholeEdge 是否要整个边都在区域内部
     * @param wholeNode 是否要整个节点都在区域内部
     * @param ignoreHideElement 是否忽略隐藏的节点
     */
    GraphModel.prototype.getAreaElement = function (leftTopPoint, rightBottomPoint, wholeEdge, wholeNode, ignoreHideElement) {
        if (wholeEdge === void 0) { wholeEdge = true; }
        if (wholeNode === void 0) { wholeNode = true; }
        if (ignoreHideElement === void 0) { ignoreHideElement = false; }
        var areaElements = [];
        var elements = [];
        this.nodes.forEach(function (node) { return elements.push(node); });
        this.edges.forEach(function (edge) { return elements.push(edge); });
        for (var i = 0; i < elements.length; i++) {
            var currentItem = elements[i];
            if ((!ignoreHideElement || currentItem.visible)
                && this.isElementInArea(currentItem, leftTopPoint, rightBottomPoint, wholeEdge, wholeNode)) {
                areaElements.push(currentItem);
            }
        }
        return areaElements;
    };
    /**
     * 获取指定类型元素对应的Model
     */
    GraphModel.prototype.getModel = function (type) {
        return this.modelMap.get(type);
    };
    /**
     * 基于Id获取节点的model
     */
    GraphModel.prototype.getNodeModelById = function (nodeId) {
        var _a;
        if (this.fakerNode && nodeId === this.fakerNode.id) {
            return this.fakerNode;
        }
        return (_a = this.nodesMap[nodeId]) === null || _a === void 0 ? void 0 : _a.model;
    };
    /**
     * 因为流程图所在的位置可以是页面任何地方
     * 当内部事件需要获取触发事件时，其相对于画布左上角的位置
     * 需要事件触发位置减去画布相对于client的位置
     */
    GraphModel.prototype.getPointByClient = function (_a) {
        var x1 = _a.x, y1 = _a.y;
        var bbox = this.rootEl.getBoundingClientRect();
        var domOverlayPosition = {
            x: x1 - bbox.left,
            y: y1 - bbox.top,
        };
        var _b = __read(this.transformModel
            .HtmlPointToCanvasPoint([domOverlayPosition.x, domOverlayPosition.y]), 2), x = _b[0], y = _b[1];
        return {
            domOverlayPosition: domOverlayPosition,
            canvasOverlayPosition: {
                x: x,
                y: y,
            },
        };
    };
    /**
     * 判断一个元素是否在指定矩形区域内。
     * @param element 节点或者边
     * @param lt 左上角点
     * @param rb 右下角点
     * @param wholeEdge 边的起点和终点都在区域内才算
     * @param wholeNode 节点的box都在区域内才算
     */
    GraphModel.prototype.isElementInArea = function (element, lt, rb, wholeEdge, wholeNode) {
        var _a;
        if (wholeEdge === void 0) { wholeEdge = true; }
        if (wholeNode === void 0) { wholeNode = true; }
        if (element.BaseType === ElementType.NODE) {
            element = element;
            // 节点是否在选区内，判断逻辑为如果节点的bbox的四个角上的点都在选区内，则判断节点在选区内
            var _b = getNodeBBox(element), minX = _b.minX, minY = _b.minY, maxX = _b.maxX, maxY = _b.maxY;
            var bboxPointsList = [
                { x: minX, y: minY },
                { x: maxX, y: minY },
                { x: maxX, y: maxY },
                { x: minX, y: maxY },
            ];
            var inArea = wholeNode;
            for (var i = 0; i < bboxPointsList.length; i++) {
                var _c = bboxPointsList[i], x = _c.x, y = _c.y;
                _a = __read(this.transformModel.CanvasPointToHtmlPoint([x, y]), 2), x = _a[0], y = _a[1];
                if (isPointInArea([x, y], lt, rb) !== wholeNode) {
                    inArea = !wholeNode;
                    break;
                }
            }
            return inArea;
        }
        if (element.BaseType === ElementType.EDGE) {
            element = element;
            var startPoint = element.startPoint, endPoint = element.endPoint;
            var startHtmlPoint = this.transformModel.CanvasPointToHtmlPoint([startPoint.x, startPoint.y]);
            var endHtmlPoint = this.transformModel.CanvasPointToHtmlPoint([endPoint.x, endPoint.y]);
            var isStartInArea = isPointInArea(startHtmlPoint, lt, rb);
            var isEndInArea = isPointInArea(endHtmlPoint, lt, rb);
            return wholeEdge ? (isStartInArea && isEndInArea) : (isStartInArea || isEndInArea);
        }
        return false;
    };
    /**
     * 使用新的数据重新设置整个画布的元素
     * 注意：将会清除画布上所有已有的节点和边
     * @param { object } graphData 图数据
     */
    GraphModel.prototype.graphDataToModel = function (graphData) {
        var _this = this;
        if (!this.width || !this.height) {
            this.resize();
        }
        this.nodes = map(graphData.nodes, function (node) {
            var Model = _this.getModel(node.type);
            if (!Model) {
                throw new Error("\u627E\u4E0D\u5230" + node.type + "\u5BF9\u5E94\u7684\u8282\u70B9\u3002");
            }
            var nodeX = node.x, nodeY = node.y;
            // 根据 grid 修正节点的 x, y
            if (nodeX && nodeY) {
                node.x = snapToGrid(nodeX, _this.gridSize);
                node.y = snapToGrid(nodeY, _this.gridSize);
                if (typeof node.text === 'object') {
                    node.text.x -= getGridOffset(nodeX, _this.gridSize);
                    node.text.y -= getGridOffset(nodeY, _this.gridSize);
                }
            }
            return new Model(node, _this);
        });
        this.edges = map(graphData.edges, function (edge) {
            var Model = _this.getModel(edge.type);
            if (!Model) {
                throw new Error("\u627E\u4E0D\u5230" + edge.type + "\u5BF9\u5E94\u7684\u8FB9\u3002");
            }
            return new Model(edge, _this);
        });
    };
    /**
     * 获取画布数据
     */
    GraphModel.prototype.modelToGraphData = function () {
        var edges = [];
        this.edges.forEach(function (edge) {
            var data = edge.getData();
            if (data && !edge.virtual)
                edges.push(data);
        });
        var nodes = [];
        this.nodes.forEach(function (node) {
            var data = node.getData();
            if (data && !node.virtual)
                nodes.push(data);
        });
        return {
            nodes: nodes,
            edges: edges,
        };
    };
    // 用户history记录的数据，忽略拖拽过程中的数据变更
    GraphModel.prototype.modelToHistoryData = function () {
        var nodeDraging = false;
        var nodes = [];
        // 如果有节点在拖拽中，不更新history
        for (var i = 0; i < this.nodes.length; i++) {
            var nodeMode = this.nodes[i];
            if (nodeMode.isDragging) {
                nodeDraging = true;
                break;
            }
            else {
                nodes.push(nodeMode.getHistoryData());
            }
        }
        if (nodeDraging) {
            return false;
        }
        // 如果有边在拖拽中，不更新history
        var edgeDraging = false;
        var edges = [];
        for (var j = 0; j < this.edges.length; j++) {
            var edgeMode = this.edges[j];
            if (edgeMode.isDragging) {
                edgeDraging = true;
                break;
            }
            else {
                edges.push(edgeMode.getHistoryData());
            }
        }
        if (edgeDraging) {
            return false;
        }
        return {
            nodes: nodes,
            edges: edges,
        };
    };
    /**
     * 获取边的model
     */
    GraphModel.prototype.getEdgeModelById = function (edgeId) {
        var _a;
        return (_a = this.edgesMap[edgeId]) === null || _a === void 0 ? void 0 : _a.model;
    };
    /**
     * 获取节点或者边的model
     */
    GraphModel.prototype.getElement = function (id) {
        return this.modelsMap[id];
    };
    /**
     * 所有节点上所有边的model
     */
    GraphModel.prototype.getNodeEdges = function (nodeId) {
        var edges = [];
        for (var i = 0; i < this.edges.length; i++) {
            var edgeModel = this.edges[i];
            var nodeAsSource = this.edges[i].sourceNodeId === nodeId;
            var nodeAsTarget = this.edges[i].targetNodeId === nodeId;
            if (nodeAsSource || nodeAsTarget) {
                edges.push(edgeModel);
            }
        }
        return edges;
    };
    /**
     * 获取选中的元素数据
     * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
     * 复制的时候不能包括此类边, 因为复制的时候不允许悬空的边
     */
    GraphModel.prototype.getSelectElements = function (isIgnoreCheck) {
        if (isIgnoreCheck === void 0) { isIgnoreCheck = true; }
        var elements = this.selectElements;
        var graphData = {
            nodes: [],
            edges: [],
        };
        elements.forEach(function (element) {
            if (element.BaseType === ElementType.NODE) {
                graphData.nodes.push(element.getData());
            }
            if (element.BaseType === ElementType.EDGE) {
                var edgeData = element.getData();
                var isNodeSelected = elements.get(edgeData.sourceNodeId)
                    && elements.get(edgeData.targetNodeId);
                if (isIgnoreCheck || isNodeSelected) {
                    graphData.edges.push(edgeData);
                }
            }
        });
        return graphData;
    };
    /**
     * 修改对应元素 model 中的属性
     * 注意：此方法慎用，除非您对logicflow内部有足够的了解。
     * 大多数情况下，请使用setProperties、updateText、changeNodeId等方法。
     * 例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
     * @param {string} id 元素id
     * @param {object} attributes 需要更新的属性
     */
    GraphModel.prototype.updateAttributes = function (id, attributes) {
        var element = this.getElement(id);
        element.updateAttributes(attributes);
    };
    /**
     * 修改节点的id， 如果不传新的id，会内部自动创建一个。
     * @param { string } oldId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    GraphModel.prototype.changeNodeId = function (oldId, newId) {
        if (!newId) {
            newId = createUuid();
        }
        if (this.nodesMap[newId]) {
            console.warn("\u5F53\u524D\u6D41\u7A0B\u56FE\u5DF2\u5B58\u5728\u8282\u70B9" + newId + ", \u4FEE\u6539\u5931\u8D25");
            return '';
        }
        if (!this.nodesMap[oldId]) {
            console.warn("\u5F53\u524D\u6D41\u7A0B\u56FE\u627E\u4E0D\u5230\u8282\u70B9" + newId + ", \u4FEE\u6539\u5931\u8D25");
            return '';
        }
        this.edges.forEach(function (edge) {
            if (edge.sourceNodeId === oldId) {
                edge.sourceNodeId = newId;
            }
            if (edge.targetNodeId === oldId) {
                edge.targetNodeId = newId;
            }
        });
        this.nodesMap[oldId].model.id = newId;
        return newId;
    };
    /**
     * 修改边的id， 如果不传新的id，会内部自动创建一个。
     * @param { string } oldId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    GraphModel.prototype.changeEdgeId = function (oldId, newId) {
        if (!newId) {
            newId = createUuid();
        }
        if (this.edgesMap[newId]) {
            console.warn("\u5F53\u524D\u6D41\u7A0B\u56FE\u5DF2\u5B58\u5728\u8FB9: " + newId + ", \u4FEE\u6539\u5931\u8D25");
            return '';
        }
        if (!this.edgesMap[oldId]) {
            console.warn("\u5F53\u524D\u6D41\u7A0B\u56FE\u627E\u4E0D\u5230\u8FB9: " + newId + ", \u4FEE\u6539\u5931\u8D25");
            return '';
        }
        this.edges.forEach(function (edge) {
            if (edge.id === oldId) {
                // edge.id = newId;
                edge.changeEdgeId(newId);
            }
        });
        return newId;
    };
    /**
     * 内部保留方法，请勿直接使用
     */
    GraphModel.prototype.setFakerNode = function (nodeModel) {
        this.fakerNode = nodeModel;
    };
    /**
     * 内部保留方法，请勿直接使用
     */
    GraphModel.prototype.removeFakerNode = function () {
        this.fakerNode = null;
    };
    /**
     * 设置指定类型的Model,请勿直接使用
     */
    GraphModel.prototype.setModel = function (type, ModelClass) {
        return this.modelMap.set(type, ModelClass);
    };
    /**
     * 将某个元素放置到顶部。
     * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
     * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
     * @see todo link 堆叠模式
     * @param id 元素Id
     */
    GraphModel.prototype.toFront = function (id) {
        var _a, _b, _c;
        var element = ((_a = this.nodesMap[id]) === null || _a === void 0 ? void 0 : _a.model) || ((_b = this.edgesMap[id]) === null || _b === void 0 ? void 0 : _b.model);
        if (element) {
            if (this.overlapMode === OverlapMode.DEFAULT) {
                (_c = this.topElement) === null || _c === void 0 ? void 0 : _c.setZIndex();
                element.setZIndex(ElementMaxzIndex);
                this.topElement = element;
            }
            if (this.overlapMode === OverlapMode.INCREASE) {
                this.setElementZIndex(id, 'top');
            }
        }
    };
    /**
     * 设置元素的zIndex.
     * 注意：默认堆叠模式下，不建议使用此方法。
     * @see todo link 堆叠模式
     * @param id 元素id
     * @param zIndex zIndex的值，可以传数字，也支持传入'top' 和 'bottom'
     */
    GraphModel.prototype.setElementZIndex = function (id, zIndex) {
        var _a, _b;
        var element = ((_a = this.nodesMap[id]) === null || _a === void 0 ? void 0 : _a.model) || ((_b = this.edgesMap[id]) === null || _b === void 0 ? void 0 : _b.model);
        if (element) {
            var index = void 0;
            if (typeof zIndex === 'number') {
                index = zIndex;
            }
            if (zIndex === 'top') {
                index = getZIndex();
            }
            if (zIndex === 'bottom') {
                index = getMinIndex();
            }
            element.setZIndex(index);
        }
    };
    /**
     * 删除节点
     * @param {string} nodeId 节点Id
     */
    GraphModel.prototype.deleteNode = function (id) {
        var nodeData = this.nodesMap[id].model.getData();
        this.deleteEdgeBySource(id);
        this.deleteEdgeByTarget(id);
        this.nodes.splice(this.nodesMap[id].index, 1);
        this.eventCenter.emit(EventType.NODE_DELETE, { data: nodeData });
    };
    /**
     * 添加节点
     * @param nodeConfig 节点配置
     */
    GraphModel.prototype.addNode = function (nodeConfig) {
        var nodeOriginData = formatData(nodeConfig);
        // 添加节点的时候，如果这个节点Id已经存在，则采用新的id
        if (nodeOriginData.id && this.nodesMap[nodeConfig.id]) {
            delete nodeOriginData.id;
        }
        var Model = this.getModel(nodeOriginData.type);
        if (!Model) {
            throw new Error("\u627E\u4E0D\u5230" + nodeOriginData.type + "\u5BF9\u5E94\u7684\u8282\u70B9\uFF0C\u8BF7\u786E\u8BA4\u662F\u5426\u5DF2\u6CE8\u518C\u6B64\u7C7B\u578B\u8282\u70B9\u3002");
        }
        nodeOriginData.x = snapToGrid(nodeOriginData.x, this.gridSize);
        nodeOriginData.y = snapToGrid(nodeOriginData.y, this.gridSize);
        var nodeModel = new Model(nodeOriginData, this);
        this.nodes.push(nodeModel);
        var nodeData = nodeModel.getData();
        this.eventCenter.emit(EventType.NODE_ADD, { data: nodeData });
        return nodeModel;
    };
    /**
    * 克隆节点
    * @param nodeId 节点Id
    */
    GraphModel.prototype.cloneNode = function (nodeId) {
        var Model = this.getNodeModelById(nodeId);
        var data = Model.getData();
        data.x += 30;
        data.y += 30;
        delete data.id;
        if (data.text) {
            data.text.x += 30;
            data.text.y += 30;
        }
        var nodeModel = this.addNode(data);
        nodeModel.setSelected(true);
        Model.setSelected(false);
        return nodeModel.getData();
    };
    /**
     * 移动节点-相对位置
     * @param nodeModel 节点Id
     * @param deltaX X轴移动距离
     * @param deltaY Y轴移动距离
     * @param isignoreRule 是否忽略移动规则限制
     */
    GraphModel.prototype.moveNode = function (nodeId, deltaX, deltaY, isignoreRule) {
        var _a;
        if (isignoreRule === void 0) { isignoreRule = false; }
        // 1) 移动节点
        var node = this.nodesMap[nodeId];
        if (!node) {
            console.warn("\u4E0D\u5B58\u5728id\u4E3A" + nodeId + "\u7684\u8282\u70B9");
            return;
        }
        var nodeModel = node.model;
        _a = __read(nodeModel.getMoveDistance(deltaX, deltaY, isignoreRule), 2), deltaX = _a[0], deltaY = _a[1];
        // 2) 移动边
        this.moveEdge(nodeId, deltaX, deltaY);
    };
    /**
     * 移动节点-绝对位置
     * @param nodeModel 节点Id
     * @param x X轴目标位置
     * @param y Y轴目标位置
     */
    GraphModel.prototype.moveNode2Coordinate = function (nodeId, x, y, isignoreRule) {
        if (isignoreRule === void 0) { isignoreRule = false; }
        // 1) 移动节点
        var node = this.nodesMap[nodeId];
        if (!node) {
            console.warn("\u4E0D\u5B58\u5728id\u4E3A" + nodeId + "\u7684\u8282\u70B9");
            return;
        }
        var nodeModel = node.model;
        var originX = nodeModel.x, originY = nodeModel.y;
        var deltaX = x - originX;
        var deltaY = y - originY;
        this.moveNode(nodeId, deltaX, deltaY, isignoreRule);
    };
    /**
     * 显示节点、连线文本编辑框
     * @param elementId 节点id
     */
    GraphModel.prototype.editText = function (id) {
        this.setElementStateById(id, ElementState.TEXT_EDIT);
    };
    /**
     * 给两个节点之间添加一条边
     * @param {object} edgeConfig
     */
    GraphModel.prototype.addEdge = function (edgeConfig) {
        var edgeOriginData = formatData(edgeConfig);
        // 边的类型优先级：自定义>全局>默认
        var type = edgeOriginData.type;
        if (!type) {
            type = this.edgeType;
        }
        if (edgeOriginData.id && this.edgesMap[edgeOriginData.id]) {
            delete edgeOriginData.id;
        }
        var Model = this.getModel(type);
        if (!Model) {
            throw new Error("\u627E\u4E0D\u5230" + type + "\u5BF9\u5E94\u7684\u8FB9\uFF0C\u8BF7\u786E\u8BA4\u662F\u5426\u5DF2\u6CE8\u518C\u6B64\u7C7B\u578B\u8FB9\u3002");
        }
        var edgeModel = new Model(__assign(__assign({}, edgeOriginData), { type: type }), this);
        var edgeData = edgeModel.getData();
        this.edges.push(edgeModel);
        this.eventCenter.emit(EventType.EDGE_ADD, { data: edgeData });
        return edgeModel;
    };
    /**
     * 移动边，内部方法，请勿直接使用
     */
    GraphModel.prototype.moveEdge = function (nodeId, deltaX, deltaY) {
        var _a;
        /* 更新相关边位置 */
        for (var i = 0; i < this.edges.length; i++) {
            var edgeModel = this.edges[i];
            var _b = edgeModel.textPosition, x = _b.x, y = _b.y;
            var nodeAsSource = this.edges[i].sourceNodeId === nodeId;
            var nodeAsTarget = this.edges[i].targetNodeId === nodeId;
            if (nodeAsSource) {
                // edgeModel.updateStartPoint({
                //   x: edgeModel.startPoint.x + deltaX,
                //   y: edgeModel.startPoint.y + deltaY,
                // });
                edgeModel.moveStartPoint(deltaX, deltaY);
            }
            if (nodeAsTarget) {
                // edgeModel.updateEndPoint({
                //   x: edgeModel.endPoint.x + deltaX,
                //   y: edgeModel.endPoint.y + deltaY,
                // });
                edgeModel.moveEndPoint(deltaX, deltaY);
            }
            // 如果有文案了，当节点移动引起文案位置修改时，找出当前文案位置与最新边距离最短距离的点
            // 最大程度保持节点位置不变且在边上
            if (nodeAsSource || nodeAsTarget) {
                // todo: 找到更好的边位置移动处理方式
                // 如果是自定义边文本位置，则移动节点的时候重新计算其位置
                if (edgeModel.customTextPosition === true) {
                    edgeModel.resetTextPosition();
                }
                else if (edgeModel.modelType === ModelType.POLYLINE_EDGE && ((_a = edgeModel.text) === null || _a === void 0 ? void 0 : _a.value)) {
                    var textPosition = edgeModel.text;
                    var newPoint = getClosestPointOfPolyline(textPosition, edgeModel.points);
                    edgeModel.moveText(newPoint.x - textPosition.x, newPoint.y - textPosition.y);
                }
                else {
                    var _c = edgeModel.textPosition, x1 = _c.x, y1 = _c.y;
                    edgeModel.moveText(x1 - x, y1 - y);
                }
            }
        }
    };
    /**
     * 删除两节点之间的边
     * @param sourceNodeId 边的起始节点
     * @param targetNodeId 边的目的节点
     */
    GraphModel.prototype.deleteEdgeBySourceAndTarget = function (sourceNodeId, targetNodeId) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].sourceNodeId === sourceNodeId
                && this.edges[i].targetNodeId === targetNodeId) {
                var edgeData = this.edges[i].getData();
                this.edges.splice(i, 1);
                i--;
                this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
            }
        }
    };
    /**
     * 基于边Id删除边
     */
    GraphModel.prototype.deleteEdgeById = function (id) {
        var edge = this.edgesMap[id];
        if (!edge) {
            return;
        }
        var idx = this.edgesMap[id].index;
        var edgeData = this.edgesMap[id].model.getData();
        this.edges.splice(idx, 1);
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
    };
    /**
     * 删除以节点Id为起点的所有边
     */
    GraphModel.prototype.deleteEdgeBySource = function (sourceNodeId) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].sourceNodeId === sourceNodeId) {
                var edgeData = this.edges[i].getData();
                this.edges.splice(i, 1);
                i--;
                this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
            }
        }
    };
    /**
     * 删除以节点Id为终点的所有边
     */
    GraphModel.prototype.deleteEdgeByTarget = function (targetNodeId) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].targetNodeId === targetNodeId) {
                var edgeData = this.edges[i].getData();
                this.edges.splice(i, 1);
                i--;
                this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
            }
        }
    };
    /**
     * 设置元素的状态，在需要保证整个画布上所有的元素只有一个元素拥有此状态时可以调用此方法。
     * 例如文本编辑、菜单显示等。
     * additionStateData: 传递的额外值，如菜单显示的时候，需要传递期望菜单显示的位置。
     */
    GraphModel.prototype.setElementStateById = function (id, state, additionStateData) {
        this.nodes.forEach(function (node) {
            if (node.id === id) {
                node.setElementState(state, additionStateData);
            }
            else {
                node.setElementState(ElementState.DEFAULT);
            }
        });
        this.edges.forEach(function (edge) {
            if (edge.id === id) {
                edge.setElementState(state, additionStateData);
            }
            else {
                edge.setElementState(ElementState.DEFAULT);
            }
        });
    };
    /**
     * 更新节点或边的文案
     * @param id 节点或者边id
     * @param value 文案内容
     */
    GraphModel.prototype.updateText = function (id, value) {
        this.nodes.forEach(function (node) {
            if (node.id === id) {
                node.updateText(value);
            }
        });
        this.edges.forEach(function (edge) {
            if (edge.id === id) {
                edge.updateText(value);
            }
        });
    };
    /**
     * 选中节点
     * @param id 节点Id
     * @param multiple 是否为多选，如果为多选，则不去掉原有已选择节点的选中状态
     */
    GraphModel.prototype.selectNodeById = function (id, multiple) {
        if (multiple === void 0) { multiple = false; }
        var _a;
        if (!multiple) {
            this.clearSelectElements();
        }
        var selectElement = (_a = this.nodesMap[id]) === null || _a === void 0 ? void 0 : _a.model;
        selectElement === null || selectElement === void 0 ? void 0 : selectElement.setSelected(true);
    };
    /**
     * 选中边
     * @param id 边Id
     * @param multiple 是否为多选，如果为多选，则不去掉原已选中边的状态
     */
    GraphModel.prototype.selectEdgeById = function (id, multiple) {
        if (multiple === void 0) { multiple = false; }
        var _a;
        if (!multiple) {
            this.clearSelectElements();
        }
        var selectElement = (_a = this.edgesMap[id]) === null || _a === void 0 ? void 0 : _a.model;
        selectElement === null || selectElement === void 0 ? void 0 : selectElement.setSelected(true);
    };
    /**
     * 将图形选中
     * @param id 选择元素ID
     * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
     */
    GraphModel.prototype.selectElementById = function (id, multiple) {
        if (multiple === void 0) { multiple = false; }
        if (!multiple) {
            this.clearSelectElements();
        }
        var selectElement = this.getElement(id);
        selectElement === null || selectElement === void 0 ? void 0 : selectElement.setSelected(true);
    };
    /**
     * 将所有选中的元素设置为非选中
     */
    GraphModel.prototype.clearSelectElements = function () {
        var _a;
        this.selectElements.forEach(function (element) {
            element === null || element === void 0 ? void 0 : element.setSelected(false);
        });
        this.selectElements.clear();
        /**
         * 如果堆叠模式为默认模式，则将置顶元素重新恢复原有层级
         */
        if (this.overlapMode === OverlapMode.DEFAULT) {
            (_a = this.topElement) === null || _a === void 0 ? void 0 : _a.setZIndex();
        }
    };
    /**
     * 批量移动节点，节点移动的时候，会动态计算所有节点与未移动节点的边位置
     * 移动的节点之间的边会保持相对位置
     */
    GraphModel.prototype.moveNodes = function (nodeIds, deltaX, deltaY, isignoreRule) {
        var _this = this;
        if (isignoreRule === void 0) { isignoreRule = false; }
        nodeIds.forEach(function (nodeId) { return _this.moveNode(nodeId, deltaX, deltaY, isignoreRule); });
    };
    /**
     * 添加节点移动限制规则，在节点移动的时候触发。
     * 如果方法返回false, 则会阻止节点移动。
     * @param fn function
     * @example
     *
     * graphModel.addNodeMoveRules((nodeModel, x, y) => {
     *   if (nodeModel.properties.disabled) {
     *     return false
     *   }
     *   return true
     * })
     *
     */
    GraphModel.prototype.addNodeMoveRules = function (fn) {
        if (!this.nodeMoveRules.includes(fn)) {
            this.nodeMoveRules.push(fn);
        }
    };
    /**
     * 设置默认的边类型
     * 也就是设置在节点直接有用户手动绘制的连线类型。
     * @param type Options.EdgeType
     */
    GraphModel.prototype.setDefaultEdgeType = function (type) {
        this.edgeType = type;
    };
    /**
    * 修改指定节点类型
    * @param id 节点id
    * @param type 节点类型
    */
    GraphModel.prototype.changeNodeType = function (id, type) {
        var nodeModel = this.getNodeModelById(id);
        if (!nodeModel) {
            console.warn("\u627E\u4E0D\u5230id\u4E3A" + id + "\u7684\u8282\u70B9");
            return;
        }
        var data = nodeModel.getData();
        data.type = type;
        var Model = this.getModel(type);
        if (!Model) {
            throw new Error("\u627E\u4E0D\u5230" + type + "\u5BF9\u5E94\u7684\u8282\u70B9\uFF0C\u8BF7\u786E\u8BA4\u662F\u5426\u5DF2\u6CE8\u518C\u6B64\u7C7B\u578B\u8282\u70B9\u3002");
        }
        var newNodeModel = new Model(data, this);
        this.nodes.splice(this.nodesMap[id].index, 1, newNodeModel);
        // 微调边
        var edgeModels = this.getNodeEdges(id);
        edgeModels.forEach(function (edge) {
            if (edge.sourceNodeId === id) {
                var point = getNodeAnchorPosition(newNodeModel, edge.startPoint, newNodeModel.width, newNodeModel.height);
                edge.updateStartPoint(point);
            }
            if (edge.targetNodeId === id) {
                var point = getNodeAnchorPosition(newNodeModel, edge.endPoint, newNodeModel.width, newNodeModel.height);
                edge.updateEndPoint(point);
            }
        });
    };
    /**
     * 切换边的类型
     * @param id 边Id
     * @param type 边类型
     */
    GraphModel.prototype.changeEdgeType = function (id, type) {
        var edgeModel = this.getEdgeModelById(id);
        if (!edgeModel) {
            console.warn("\u627E\u4E0D\u5230id\u4E3A" + id + "\u7684\u8FB9");
            return;
        }
        if (edgeModel.type === type) {
            return;
        }
        var data = edgeModel.getData();
        data.type = type;
        var Model = this.getModel(type);
        if (!Model) {
            throw new Error("\u627E\u4E0D\u5230" + type + "\u5BF9\u5E94\u7684\u8282\u70B9\uFF0C\u8BF7\u786E\u8BA4\u662F\u5426\u5DF2\u6CE8\u518C\u6B64\u7C7B\u578B\u8282\u70B9\u3002");
        }
        // 为了保持切换类型时不复用上一个类型的轨迹
        delete data.pointsList;
        var newEdgeModel = new Model(data, this);
        this.edges.splice(this.edgesMap[id].index, 1, newEdgeModel);
    };
    /**
     * 获取所有以此节点为终点的边
     */
    GraphModel.prototype.getNodeIncomingEdge = function (nodeId) {
        var edges = [];
        this.edges.forEach(function (edge) {
            if (edge.targetNodeId === nodeId) {
                edges.push(edge);
            }
        });
        return edges;
    };
    /**
     * 获取所有以此节点为起点的边
     */
    GraphModel.prototype.getNodeOutgoingEdge = function (nodeId) {
        var edges = [];
        this.edges.forEach(function (edge) {
            if (edge.sourceNodeId === nodeId) {
                edges.push(edge);
            }
        });
        return edges;
    };
    /**
     * 获取节点连接到的所有起始节点
     */
    GraphModel.prototype.getNodeIncomingNode = function (nodeId) {
        var _this = this;
        var nodes = [];
        this.edges.forEach(function (edge) {
            if (edge.targetNodeId === nodeId) {
                nodes.push(_this.nodesMap[edge.sourceNodeId].model);
            }
        });
        return nodes;
    };
    /**
     * 获取节点连接到的所有目标节点
     */
    GraphModel.prototype.getNodeOutgoingNode = function (nodeId) {
        var _this = this;
        var nodes = [];
        this.edges.forEach(function (edge) {
            if (edge.sourceNodeId === nodeId) {
                nodes.push(_this.nodesMap[edge.targetNodeId].model);
            }
        });
        return nodes;
    };
    /**
     * 设置主题
     * todo docs link
     */
    GraphModel.prototype.setTheme = function (style) {
        this.theme = updateTheme(__assign(__assign({}, this.theme), style));
    };
    /**
     * 重新设置画布的宽高
     */
    GraphModel.prototype.resize = function (width, height) {
        this.width = width || this.rootEl.getBoundingClientRect().width;
        this.height = height || this.rootEl.getBoundingClientRect().height;
        if (!this.width || !this.height) {
            console.warn('渲染画布的时候无法获取画布宽高，请确认在container已挂载到DOM。@see https://github.com/didi/LogicFlow/issues/675');
        }
    };
    /**
     * 清空画布
     */
    GraphModel.prototype.clearData = function () {
        this.nodes = [];
        this.edges = [];
    };
    /**
     * 获取图形区域虚拟矩型的尺寸和中心坐标
     * @returns
     */
    GraphModel.prototype.getVirtualRectSize = function () {
        var nodes = this.nodes;
        var nodesX = [];
        var nodesY = [];
        // 获取所有节点组成的x，y轴最大最小值，这里考虑了图形的长宽和边框
        nodes.forEach(function (node) {
            var x = node.x, y = node.y, width = node.width, height = node.height;
            var _a = node.getNodeStyle().strokeWidth, strokeWidth = _a === void 0 ? 0 : _a;
            nodesX = nodesX.concat([x + width / 2 + strokeWidth, x - width / 2 - strokeWidth]);
            nodesY = nodesY.concat([y + height / 2 + strokeWidth, y - height / 2 - strokeWidth]);
        });
        var minX = Math.min.apply(Math, __spread(nodesX));
        var maxX = Math.max.apply(Math, __spread(nodesX));
        var minY = Math.min.apply(Math, __spread(nodesY));
        var maxY = Math.max.apply(Math, __spread(nodesY));
        var virtualRectWidth = (maxX - minX) || 0;
        var virtualRectHeight = (maxY - minY) || 0;
        // 获取虚拟矩型的中心坐标
        var virtualRectCenterPositionX = minX + virtualRectWidth / 2;
        var virtualRectCenterPositionY = minY + virtualRectHeight / 2;
        return {
            virtualRectWidth: virtualRectWidth,
            virtualRectHeight: virtualRectHeight,
            virtualRectCenterPositionX: virtualRectCenterPositionX,
            virtualRectCenterPositionY: virtualRectCenterPositionY,
        };
    };
    /**
     * 将图形整体移动到画布中心
     */
    GraphModel.prototype.translateCenter = function () {
        var _a = this, nodes = _a.nodes, width = _a.width, height = _a.height, rootEl = _a.rootEl, transformModel = _a.transformModel;
        if (!nodes.length) {
            return;
        }
        var containerWidth = width || rootEl.clientWidth;
        var containerHeight = height || rootEl.clientHeight;
        var _b = this.getVirtualRectSize(), virtualRectCenterPositionX = _b.virtualRectCenterPositionX, virtualRectCenterPositionY = _b.virtualRectCenterPositionY;
        // 将虚拟矩型移动到画布中心
        transformModel.focusOn(virtualRectCenterPositionX, virtualRectCenterPositionY, containerWidth, containerHeight);
    };
    /**
     * 画布图形适应屏幕大小
     * @param verticalOffset number 距离盒子上下的距离， 默认为20
     * @param horizontalOffset number 距离盒子左右的距离， 默认为20
     */
    GraphModel.prototype.fitView = function (verticalOffset, horizontalOffset) {
        if (verticalOffset === void 0) { verticalOffset = 20; }
        if (horizontalOffset === void 0) { horizontalOffset = 20; }
        var _a = this, nodes = _a.nodes, width = _a.width, height = _a.height, rootEl = _a.rootEl, transformModel = _a.transformModel;
        if (!nodes.length) {
            return;
        }
        var containerWidth = width || rootEl.clientWidth;
        var containerHeight = height || rootEl.clientHeight;
        var _b = this.getVirtualRectSize(), virtualRectWidth = _b.virtualRectWidth, virtualRectHeight = _b.virtualRectHeight, virtualRectCenterPositionX = _b.virtualRectCenterPositionX, virtualRectCenterPositionY = _b.virtualRectCenterPositionY;
        var zoomRatioX = (virtualRectWidth + horizontalOffset) / containerWidth;
        var zoomRatioY = (virtualRectHeight + verticalOffset) / containerHeight;
        var zoomRatio = 0;
        zoomRatio = 1 / Math.max(zoomRatioX, zoomRatioY);
        var point = [containerWidth / 2, containerHeight / 2];
        // 适应画布大小
        transformModel.zoom(zoomRatio, point);
        // 将虚拟矩型移动到画布中心
        transformModel.focusOn(virtualRectCenterPositionX, virtualRectCenterPositionY, containerWidth, containerHeight);
    };
    /**
     * 开启边的动画
     * @param edgeId any
     */
    GraphModel.prototype.openEdgeAnimation = function (edgeId) {
        var edgeModel = this.getEdgeModelById(edgeId);
        edgeModel.openEdgeAnimation();
    };
    /**
     * 关闭边的动画
     * @param edgeId any
     */
    GraphModel.prototype.closeEdgeAnimation = function (edgeId) {
        var edgeModel = this.getEdgeModelById(edgeId);
        edgeModel.closeEdgeAnimation();
    };
    __decorate([
        observable
    ], GraphModel.prototype, "width", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "height", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "edgeType", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "nodes", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "edges", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "overlapMode", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "background", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "transformModel", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "editConfigModel", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "gridSize", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "partial", void 0);
    __decorate([
        observable
    ], GraphModel.prototype, "fakerNode", void 0);
    __decorate([
        computed
    ], GraphModel.prototype, "nodesMap", null);
    __decorate([
        computed
    ], GraphModel.prototype, "edgesMap", null);
    __decorate([
        computed
    ], GraphModel.prototype, "modelsMap", null);
    __decorate([
        computed
    ], GraphModel.prototype, "sortElements", null);
    __decorate([
        computed
    ], GraphModel.prototype, "textEditElement", null);
    __decorate([
        computed
    ], GraphModel.prototype, "selectElements", null);
    __decorate([
        action
    ], GraphModel.prototype, "setFakerNode", null);
    __decorate([
        action
    ], GraphModel.prototype, "removeFakerNode", null);
    __decorate([
        action
    ], GraphModel.prototype, "setModel", null);
    __decorate([
        action
    ], GraphModel.prototype, "toFront", null);
    __decorate([
        action
    ], GraphModel.prototype, "setElementZIndex", null);
    __decorate([
        action
    ], GraphModel.prototype, "deleteNode", null);
    __decorate([
        action
    ], GraphModel.prototype, "addNode", null);
    __decorate([
        action
    ], GraphModel.prototype, "cloneNode", null);
    __decorate([
        action
    ], GraphModel.prototype, "moveNode", null);
    __decorate([
        action
    ], GraphModel.prototype, "moveNode2Coordinate", null);
    __decorate([
        action
    ], GraphModel.prototype, "editText", null);
    __decorate([
        action
    ], GraphModel.prototype, "addEdge", null);
    __decorate([
        action
    ], GraphModel.prototype, "moveEdge", null);
    __decorate([
        action
    ], GraphModel.prototype, "deleteEdgeBySourceAndTarget", null);
    __decorate([
        action
    ], GraphModel.prototype, "deleteEdgeById", null);
    __decorate([
        action
    ], GraphModel.prototype, "deleteEdgeBySource", null);
    __decorate([
        action
    ], GraphModel.prototype, "deleteEdgeByTarget", null);
    __decorate([
        action
    ], GraphModel.prototype, "setElementStateById", null);
    __decorate([
        action
    ], GraphModel.prototype, "updateText", null);
    __decorate([
        action
    ], GraphModel.prototype, "selectNodeById", null);
    __decorate([
        action
    ], GraphModel.prototype, "selectEdgeById", null);
    __decorate([
        action
    ], GraphModel.prototype, "selectElementById", null);
    __decorate([
        action
    ], GraphModel.prototype, "clearSelectElements", null);
    __decorate([
        action
    ], GraphModel.prototype, "moveNodes", null);
    __decorate([
        action
    ], GraphModel.prototype, "setDefaultEdgeType", null);
    __decorate([
        action
    ], GraphModel.prototype, "changeNodeType", null);
    __decorate([
        action
    ], GraphModel.prototype, "changeEdgeType", null);
    __decorate([
        action
    ], GraphModel.prototype, "getNodeIncomingEdge", null);
    __decorate([
        action
    ], GraphModel.prototype, "getNodeOutgoingEdge", null);
    __decorate([
        action
    ], GraphModel.prototype, "getNodeIncomingNode", null);
    __decorate([
        action
    ], GraphModel.prototype, "getNodeOutgoingNode", null);
    __decorate([
        action
    ], GraphModel.prototype, "setTheme", null);
    __decorate([
        action
    ], GraphModel.prototype, "resize", null);
    __decorate([
        action
    ], GraphModel.prototype, "clearData", null);
    __decorate([
        action
    ], GraphModel.prototype, "translateCenter", null);
    __decorate([
        action
    ], GraphModel.prototype, "fitView", null);
    __decorate([
        action
    ], GraphModel.prototype, "openEdgeAnimation", null);
    __decorate([
        action
    ], GraphModel.prototype, "closeEdgeAnimation", null);
    return GraphModel;
}());
export { GraphModel };
export default GraphModel;
