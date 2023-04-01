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
import { render, h } from 'preact';
import { observer } from 'mobx-react';
// import * as mobx from 'mobx';
// import { IReactComponent } from 'mobx-react/dist/types/IReactComponent';
import GraphModel from './model/GraphModel';
import Graph from './view/Graph';
import Dnd from './view/behavior/DnD';
import * as Options from './options';
import * as _Model from './model';
import * as _View from './view';
import History from './history/History';
import Tool from './tool';
import Keyboard from './keyboard';
import { formatData } from './util/compatible';
import { initDefaultShortcut } from './keyboard/shortcut';
import SnaplineModel from './model/SnaplineModel';
import { snaplineTool } from './tool/SnaplineTool';
import { ElementType, EventType } from './constant/constant';
if (process.env.NODE_ENV === 'development') {
    require('preact/debug'); // eslint-disable-line global-require
}
var LogicFlow = /** @class */ (function () {
    function LogicFlow(options) {
        var _this = this;
        this.viewMap = new Map();
        this.components = [];
        /**
         * 插件扩展方法
         * @example
         */
        this.extension = {};
        /**
         * 内部保留方法
         * 获取指定类型的view
         */
        this.getView = function (type) { return _this.viewMap.get(type); };
        options = Options.get(options);
        this.options = options;
        this.container = options.container;
        this.plugins = options.plugins;
        // model 初始化
        this.graphModel = new GraphModel(__assign({}, options));
        // 附加功能初始化
        this.tool = new Tool(this);
        this.history = new History(this.graphModel.eventCenter);
        this.dnd = new Dnd({ lf: this });
        this.keyboard = new Keyboard({ lf: this, keyboard: options.keyboard });
        // 不可编辑模式没有开启，且没有关闭对齐线
        if (!options.isSilentMode && options.snapline !== false) {
            this.snaplineModel = new SnaplineModel(this.graphModel);
            snaplineTool(this.graphModel.eventCenter, this.snaplineModel);
        }
        // 先初始化默认内置快捷键
        initDefaultShortcut(this, this.graphModel);
        // 然后再初始化自定义快捷键，自定义快捷键可以覆盖默认快捷键.
        // 插件最后初始化。方便插件强制覆盖内置快捷键
        this.keyboard.initShortcuts();
        // init 放到最后
        this.defaultRegister();
        this.installPlugins(options.disabledPlugins);
    }
    /**
     * 注册自定义节点和边
     * 支持两种方式
     * 方式一（推荐）
     * 详情见 todo: docs link
     * @example
     * import { RectNode, RectModel } from '@logicflow/core'
     * class CustomView extends RectNode {
     * }
     * class CustomModel extends RectModel {
     * }
     * lf.register({
     *   type: 'custom',
     *   view: CustomView,
     *   model: CustomModel
     * })
     * 方式二
     * 不推荐，极个别在自定义的时候需要用到lf的情况下可以用这种方式。
     * 大多数情况下，我们可以直接在view中从this.props中获取graphModel
     * 或者model中直接this.graphModel获取model的方法。
     * @example
     * lf.register('custom', ({ RectNode, RectModel }) => {
     *    class CustomView extends RectNode {}
     *    class CustomModel extends RectModel {}
     *    return {
     *      view: CustomView,
     *      model: CustomModel
     *    }
     * })
     */
    LogicFlow.prototype.register = function (type, fn, isObserverView) {
        if (isObserverView === void 0) { isObserverView = true; }
        // 方式1
        if (typeof type !== 'string') {
            this.registerElement(type);
            return;
        }
        var registerParam = {
            BaseEdge: _View.BaseEdge,
            BaseEdgeModel: _Model.BaseEdgeModel,
            BaseNode: _View.BaseNode,
            BaseNodeModel: _Model.BaseNodeModel,
            RectNode: _View.RectNode,
            RectNodeModel: _Model.RectNodeModel,
            CircleNode: _View.CircleNode,
            CircleNodeModel: _Model.CircleNodeModel,
            PolygonNode: _View.PolygonNode,
            PolygonNodeModel: _Model.PolygonNodeModel,
            TextNode: _View.TextNode,
            TextNodeModel: _Model.TextNodeModel,
            LineEdge: _View.LineEdge,
            LineEdgeModel: _Model.LineEdgeModel,
            DiamondNode: _View.DiamondNode,
            DiamondNodeModel: _Model.DiamondNodeModel,
            PolylineEdge: _View.PolylineEdge,
            PolylineEdgeModel: _Model.PolylineEdgeModel,
            BezierEdge: _View.BezierEdge,
            BezierEdgeModel: _Model.BezierEdgeModel,
            EllipseNode: _View.EllipseNode,
            EllipseNodeModel: _Model.EllipseNodeModel,
            HtmlNode: _View.HtmlNode,
            HtmlNodeModel: _Model.HtmlNodeModel,
            // mobx,
            h: h,
            type: type,
        };
        // 为了能让后来注册的可以继承前面注册的
        // 例如我注册一个”开始节点“
        // 然后我再想注册一个”立即开始节点“
        // 注册传递参数改为动态。
        this.viewMap.forEach(function (component) {
            var key = component.extendKey;
            if (key) {
                registerParam[key] = component;
            }
        });
        this.graphModel.modelMap.forEach(function (component) {
            var key = component.extendKey;
            if (key) {
                registerParam[key] = component;
            }
        });
        var _a = fn(registerParam), ViewClass = _a.view, ModelClass = _a.model;
        var vClass = ViewClass;
        if (isObserverView && !vClass.isObervered) {
            vClass.isObervered = true;
            // @ts-ignore
            vClass = observer(vClass);
        }
        this.setView(type, vClass);
        this.graphModel.setModel(type, ModelClass);
    };
    LogicFlow.prototype.registerElement = function (config) {
        var vClass = config.view;
        if (config.isObserverView !== false && !vClass.isObervered) {
            vClass.isObervered = true;
            // @ts-ignore
            vClass = observer(vClass);
        }
        this.setView(config.type, vClass);
        this.graphModel.setModel(config.type, config.model);
    };
    /**
     * 批量注册
     * @param elements 注册的元素
     */
    LogicFlow.prototype.batchRegister = function (elements) {
        var _this = this;
        if (elements === void 0) { elements = []; }
        elements.forEach(function (element) {
            _this.registerElement(element);
        });
    };
    LogicFlow.prototype.defaultRegister = function () {
        // register default shape
        this.registerElement({
            view: _View.RectNode,
            model: _Model.RectNodeModel,
            type: 'rect',
        });
        this.registerElement({
            type: 'circle',
            view: _View.CircleNode,
            model: _Model.CircleNodeModel,
        });
        this.registerElement({
            type: 'polygon',
            view: _View.PolygonNode,
            model: _Model.PolygonNodeModel,
        });
        this.registerElement({
            type: 'line',
            view: _View.LineEdge,
            model: _Model.LineEdgeModel,
        });
        this.registerElement({
            type: 'polyline',
            view: _View.PolylineEdge,
            model: _Model.PolylineEdgeModel,
        });
        this.registerElement({
            type: 'bezier',
            view: _View.BezierEdge,
            model: _Model.BezierEdgeModel,
        });
        this.registerElement({
            type: 'text',
            view: _View.TextNode,
            model: _Model.TextNodeModel,
        });
        this.registerElement({
            type: 'ellipse',
            view: _View.EllipseNode,
            model: _Model.EllipseNodeModel,
        });
        this.registerElement({
            type: 'diamond',
            view: _View.DiamondNode,
            model: _Model.DiamondNodeModel,
        });
        this.registerElement({
            type: 'html',
            view: _View.HtmlNode,
            model: _Model.HtmlNodeModel,
        });
    };
    /**
     * 将图形选中
     * @param id 选择元素ID
     * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
     */
    LogicFlow.prototype.selectElementById = function (id, multiple) {
        if (multiple === void 0) { multiple = false; }
        this.graphModel.selectElementById(id, multiple);
        if (!multiple) {
            this.graphModel.toFront(id);
        }
    };
    /**
     * 定位到画布视口中心
     * 支持用户传入图形当前的坐标或id，可以通过type来区分是节点还是边的id，也可以不传（兜底）
     * @param focusOnArgs.id 如果传入的是id, 则画布视口中心移动到此id的元素中心点。
     * @param focusOnArgs.coordinate 如果传入的是坐标，则画布视口中心移动到此坐标。
     */
    LogicFlow.prototype.focusOn = function (focusOnArgs) {
        var transformModel = this.graphModel.transformModel;
        var coordinate = focusOnArgs.coordinate;
        var id = focusOnArgs.id;
        if (!coordinate) {
            var model = this.getNodeModelById(id);
            if (model) {
                coordinate = model.getData();
            }
            var edgeModel = this.getEdgeModelById(id);
            if (edgeModel) {
                coordinate = edgeModel.textPosition;
            }
        }
        var x = coordinate.x, y = coordinate.y;
        transformModel.focusOn(x, y, this.graphModel.width, this.graphModel.height);
    };
    /**
     * 设置主题样式
     * @param { object } style 自定义主题样式
     * todo docs link
     */
    LogicFlow.prototype.setTheme = function (style) {
        this.graphModel.setTheme(style);
    };
    /**
     * 重新设置画布的宽高
     * 不传会自动计算画布宽高
     */
    LogicFlow.prototype.resize = function (width, height) {
        this.graphModel.resize(width, height);
        this.options.width = this.graphModel.width;
        this.options.height = this.graphModel.height;
    };
    /**
     * 设置默认的边类型。
     * 也就是设置在节点直接有用户手动绘制的连线类型。
     * @param type Options.EdgeType
     */
    LogicFlow.prototype.setDefaultEdgeType = function (type) {
        this.graphModel.setDefaultEdgeType(type);
    };
    /**
     * 更新节点或边的文案
     * @param id 节点或者边id
     * @param value 文案内容
     */
    LogicFlow.prototype.updateText = function (id, value) {
        this.graphModel.updateText(id, value);
    };
    /**
     * 删除元素，在不确定当前id是节点还是边时使用
     * @param id 元素id
     */
    LogicFlow.prototype.deleteElement = function (id) {
        var _a;
        var _b, _c;
        var model = this.getModelById(id);
        if (!model)
            return false;
        var callback = (_a = {},
            _a[ElementType.NODE] = this.deleteNode,
            _a[ElementType.EDGE] = this.deleteEdge,
            _a);
        var BaseType = model.BaseType;
        return (_c = (_b = callback[BaseType]) === null || _b === void 0 ? void 0 : _b.call(this, id)) !== null && _c !== void 0 ? _c : false;
    };
    /**
     * 获取节点或边对象
     * @param id id
     */
    LogicFlow.prototype.getModelById = function (id) {
        return this.graphModel.getElement(id);
    };
    /**
     * 获取节点或边的数据
     * @param id id
     */
    LogicFlow.prototype.getDataById = function (id) {
        return this.graphModel.getElement(id).getData();
    };
    /**
     * 修改指定节点类型
     * @param id 节点id
     * @param type 节点类型
     */
    LogicFlow.prototype.changeNodeType = function (id, type) {
        this.graphModel.changeNodeType(id, type);
    };
    /**
     * 切换边的类型
     * @param id 边Id
     * @param type 边类型
     */
    LogicFlow.prototype.changeEdgeType = function (id, type) {
        this.graphModel.changeEdgeType(id, type);
    };
    /**
     * 获取节点连接的所有边的model
     * @param nodeId 节点ID
     * @returns model数组
     */
    LogicFlow.prototype.getNodeEdges = function (nodeId) {
        return this.graphModel.getNodeEdges(nodeId);
    };
    /**
     * 添加节点
     * @param nodeConfig 节点配置
     */
    LogicFlow.prototype.addNode = function (nodeConfig) {
        return this.graphModel.addNode(nodeConfig);
    };
    /**
     * 删除节点
     * @param {string} nodeId 节点Id
     */
    LogicFlow.prototype.deleteNode = function (nodeId) {
        var Model = this.graphModel.getNodeModelById(nodeId);
        if (!Model) {
            return false;
        }
        var data = Model.getData();
        var guards = this.options.guards;
        var enabledDelete = guards && guards.beforeDelete ? guards.beforeDelete(data) : true;
        if (enabledDelete) {
            this.graphModel.deleteNode(nodeId);
        }
        return enabledDelete;
    };
    /**
     * 克隆节点
     * @param nodeId 节点Id
     */
    LogicFlow.prototype.cloneNode = function (nodeId) {
        var Model = this.graphModel.getNodeModelById(nodeId);
        var data = Model.getData();
        var guards = this.options.guards;
        var enabledClone = guards && guards.beforeClone ? guards.beforeClone(data) : true;
        if (enabledClone) {
            return this.graphModel.cloneNode(nodeId);
        }
    };
    /**
     * 修改节点的id， 如果不传新的id，会内部自动创建一个。
     * @param { string } oldId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    LogicFlow.prototype.changeNodeId = function (oldId, newId) {
        return this.graphModel.changeNodeId(oldId, newId);
    };
    /**
     * 获取节点对象
     * @param nodeId 节点Id
     */
    LogicFlow.prototype.getNodeModelById = function (nodeId) {
        return this.graphModel.getNodeModelById(nodeId);
    };
    /**
     * 获取节点数据
     * @param nodeId 节点
     */
    LogicFlow.prototype.getNodeDataById = function (nodeId) {
        return this.graphModel.getNodeModelById(nodeId).getData();
    };
    /**
     * 给两个节点之间添加一条边
     * @example
     * lf.addEdge({
     *   type: 'polygon'
     *   sourceNodeId: 'node_id_1',
     *   targetNodeId: 'node_id_2',
     * })
     * @param {object} edgeConfig
     */
    LogicFlow.prototype.addEdge = function (edgeConfig) {
        return this.graphModel.addEdge(edgeConfig);
    };
    /**
     * 删除边
     * @param {string} edgeId 边Id
     */
    LogicFlow.prototype.deleteEdge = function (edgeId) {
        var guards = this.options.guards;
        var edge = this.graphModel.edgesMap[edgeId];
        if (!edge) {
            return false;
        }
        var edgeData = edge.model.getData();
        var enabledDelete = guards && guards.beforeDelete
            ? guards.beforeDelete(edgeData) : true;
        if (enabledDelete) {
            this.graphModel.deleteEdgeById(edgeId);
        }
        return enabledDelete;
    };
    /**
     * 删除指定类型的边, 基于边起点和终点，可以只传其一。
     * @param config.sourceNodeId 边的起点节点ID
     * @param config.targetNodeId 边的终点节点ID
     */
    LogicFlow.prototype.deleteEdgeByNodeId = function (config) {
        var sourceNodeId = config.sourceNodeId, targetNodeId = config.targetNodeId;
        if (sourceNodeId && targetNodeId) {
            this.graphModel.deleteEdgeBySourceAndTarget(sourceNodeId, targetNodeId);
        }
        else if (sourceNodeId) {
            this.graphModel.deleteEdgeBySource(sourceNodeId);
        }
        else if (targetNodeId) {
            this.graphModel.deleteEdgeByTarget(targetNodeId);
        }
    };
    /**
     * 修改边的id， 如果不传新的id，会内部自动创建一个。
     * @param { string } oldId 将要被修改的id
     * @param { string } newId 可选，修改后的id
     * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
     */
    LogicFlow.prototype.changeEdgeId = function (oldId, newId) {
        return this.graphModel.changeEdgeId(oldId, newId);
    };
    /**
     * 基于边Id获取边的model
     * @param edgeId 边的Id
     * @return model
     */
    LogicFlow.prototype.getEdgeModelById = function (edgeId) {
        var _a;
        var edgesMap = this.graphModel.edgesMap;
        return (_a = edgesMap[edgeId]) === null || _a === void 0 ? void 0 : _a.model;
    };
    /**
     * 获取满足条件边的model
     * @param edgeFilter 过滤条件
     * @example
     * 获取所有起点为节点A的边的model
     * lf.getEdgeModels({
     *   sourceNodeId: 'nodeA_id'
     * })
     * 获取所有终点为节点B的边的model
     * lf.getEdgeModels({
     *   targetNodeId: 'nodeB_id'
     * })
     * 获取起点为节点A，终点为节点B的边
     * lf.getEdgeModels({
     *   sourceNodeId: 'nodeA_id',
     *   targetNodeId: 'nodeB_id'
     * })
     * @return model数组
     */
    LogicFlow.prototype.getEdgeModels = function (edgeFilter) {
        var edges = this.graphModel.edges;
        var sourceNodeId = edgeFilter.sourceNodeId, targetNodeId = edgeFilter.targetNodeId;
        if (sourceNodeId && targetNodeId) {
            var result_1 = [];
            edges.forEach(function (edge) {
                if (edge.sourceNodeId === sourceNodeId && edge.targetNodeId === targetNodeId) {
                    result_1.push(edge);
                }
            });
            return result_1;
        }
        if (sourceNodeId) {
            var result_2 = [];
            edges.forEach(function (edge) {
                if (edge.sourceNodeId === sourceNodeId) {
                    result_2.push(edge);
                }
            });
            return result_2;
        }
        if (targetNodeId) {
            var result_3 = [];
            edges.forEach(function (edge) {
                if (edge.targetNodeId === targetNodeId) {
                    result_3.push(edge);
                }
            });
            return result_3;
        }
        return [];
    };
    /**
     * 基于id获取边数据
     * @param edgeId 边Id
     * @returns EdgeData
     */
    LogicFlow.prototype.getEdgeDataById = function (edgeId) {
        var _a;
        return (_a = this.getEdgeModelById(edgeId)) === null || _a === void 0 ? void 0 : _a.getData();
    };
    /**
     * 获取所有以此节点为终点的边
     */
    LogicFlow.prototype.getNodeIncomingEdge = function (nodeId) {
        return this.graphModel.getNodeIncomingEdge(nodeId);
    };
    /**
     * 获取所有以此节点为起点的边
     */
    LogicFlow.prototype.getNodeOutgoingEdge = function (nodeId) {
        return this.graphModel.getNodeOutgoingEdge(nodeId);
    };
    /**
     * 获取节点连接到的所有起始节点
     */
    LogicFlow.prototype.getNodeIncomingNode = function (nodeId) {
        return this.graphModel.getNodeIncomingNode(nodeId);
    };
    /**
     * 获取节点连接到的所有目标节点
     */
    LogicFlow.prototype.getNodeOutgoingNode = function (nodeId) {
        return this.graphModel.getNodeOutgoingNode(nodeId);
    };
    /**
     * 显示节点、连线文本编辑框
     * @param id 元素id
     */
    LogicFlow.prototype.editText = function (id) {
        this.graphModel.editText(id);
    };
    /**
     * 设置元素的自定义属性
     * @see todo docs link
     * @param id 元素的id
     * @param properties 自定义属性
     */
    LogicFlow.prototype.setProperties = function (id, properties) {
        var _a;
        (_a = this.graphModel.getElement(id)) === null || _a === void 0 ? void 0 : _a.setProperties(formatData(properties));
    };
    LogicFlow.prototype.deleteProperty = function (id, key) {
        var _a;
        (_a = this.graphModel.getElement(id)) === null || _a === void 0 ? void 0 : _a.deleteProperty(key);
    };
    /**
     * 获取元素的自定义属性
     * @param id 元素的id
     * @returns 自定义属性
     */
    LogicFlow.prototype.getProperties = function (id) {
        var _a;
        return (_a = this.graphModel.getElement(id)) === null || _a === void 0 ? void 0 : _a.getProperties();
    };
    /**
     * 将某个元素放置到顶部。
     * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
     * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
     * @see todo link 堆叠模式
     * @param id 元素Id
     */
    LogicFlow.prototype.toFront = function (id) {
        this.graphModel.toFront(id);
    };
    /**
     * 设置元素的zIndex.
     * 注意：默认堆叠模式下，不建议使用此方法。
     * @see todo link 堆叠模式
     * @param id 元素id
     * @param zIndex zIndex的值，可以传数字，也支持传入'top' 和 'bottom'
     */
    LogicFlow.prototype.setElementZIndex = function (id, zIndex) {
        return this.graphModel.setElementZIndex(id, zIndex);
    };
    /**
     * 添加多个元素, 包括边和节点。
     */
    LogicFlow.prototype.addElements = function (_a) {
        var _this = this;
        var nodes = _a.nodes, edges = _a.edges;
        var nodeIdMap = {};
        var elements = {
            nodes: [],
            edges: [],
        };
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var preId = node.id;
            var nodeModel = this.addNode(node);
            if (!nodeModel)
                return;
            if (preId)
                nodeIdMap[preId] = nodeModel.id;
            elements.nodes.push(nodeModel);
        }
        edges.forEach(function (edge) {
            var sourceId = edge.sourceNodeId;
            var targetId = edge.targetNodeId;
            if (nodeIdMap[sourceId])
                edge.sourceNodeId = nodeIdMap[sourceId];
            if (nodeIdMap[targetId])
                edge.targetNodeId = nodeIdMap[targetId];
            var edgeModel = _this.graphModel.addEdge(edge);
            elements.edges.push(edgeModel);
        });
        return elements;
    };
    /**
     * 获取指定区域内的所有元素，此区域必须是DOM层。
     * 例如鼠标绘制选区后，获取选区内的所有元素。
     * @see todo 分层
     * @param leftTopPoint 区域左上角坐标, dom层坐标
     * @param rightBottomPoint 区域右下角坐标，dom层坐标
     */
    LogicFlow.prototype.getAreaElement = function (leftTopPoint, rightBottomPoint, wholeEdge, wholeNode, ignoreHideElement) {
        if (wholeEdge === void 0) { wholeEdge = true; }
        if (wholeNode === void 0) { wholeNode = true; }
        if (ignoreHideElement === void 0) { ignoreHideElement = false; }
        return this.graphModel.getAreaElement(leftTopPoint, rightBottomPoint, wholeEdge, wholeNode, ignoreHideElement).map(function (element) { return element.getData(); });
    };
    /**
     * 获取选中的元素数据
     * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
     * 注意：复制的时候不能包括此类边, 因为复制的时候不允许悬空的边。
     */
    LogicFlow.prototype.getSelectElements = function (isIgnoreCheck) {
        if (isIgnoreCheck === void 0) { isIgnoreCheck = true; }
        return this.graphModel.getSelectElements(isIgnoreCheck);
    };
    /**
     * 将所有选中的元素设置为非选中
     */
    LogicFlow.prototype.clearSelectElements = function () {
        this.graphModel.clearSelectElements();
    };
    /**
     * 获取流程绘图数据
     * 注意: getGraphData返回的数据受到adapter影响，所以其数据格式不一定是logicflow内部图数据格式。
     * 如果实现通用插件，请使用getGraphRawData
     */
    LogicFlow.prototype.getGraphData = function () {
        var data = this.graphModel.modelToGraphData();
        if (this.adapterOut) {
            return this.adapterOut(data);
        }
        return data;
    };
    /**
     * 获取流程绘图原始数据
     * 在存在adapter时，可以使用getGraphRawData获取图原始数据
     */
    LogicFlow.prototype.getGraphRawData = function () {
        return this.graphModel.modelToGraphData();
    };
    /**
     * 清空画布
     */
    LogicFlow.prototype.clearData = function () {
        this.graphModel.clearData();
    };
    /**
     * 更新流程图编辑相关设置
     * @param {object} config 编辑配置
     * @see todo docs link
     */
    LogicFlow.prototype.updateEditConfig = function (config) {
        this.graphModel.editConfigModel.updateEditConfig(config);
    };
    /**
     * 获取流程图当前编辑相关设置
     * @see todo docs link
     */
    LogicFlow.prototype.getEditConfig = function () {
        return this.graphModel.editConfigModel.getConfig();
    };
    /**
     * 获取事件位置相对于画布左上角的坐标
     * 画布所在的位置可以是页面任何地方，原生事件返回的坐标是相对于页面左上角的，该方法可以提供以画布左上角为原点的准确位置。
     * @see todo link
     * @param {number} x 事件x坐标
     * @param {number} y 事件y坐标
     * @returns {object} Point 事件位置的坐标
     * @returns {object} Point.domOverlayPosition HTML层上的坐标
     * @returns {object} Point.canvasOverlayPosition SVG层上的坐标
     */
    LogicFlow.prototype.getPointByClient = function (x, y) {
        return this.graphModel.getPointByClient({ x: x, y: y });
    };
    /**
     * 历史记录操作
     * 返回上一步
     */
    LogicFlow.prototype.undo = function () {
        if (!this.history.undoAble())
            return;
        // formatData兼容vue数据
        var graphData = formatData(this.history.undo());
        this.clearSelectElements();
        this.graphModel.graphDataToModel(graphData);
    };
    /**
     * 历史记录操作
     * 恢复下一步
     */
    LogicFlow.prototype.redo = function () {
        if (!this.history.redoAble())
            return;
        // formatData兼容vue数据
        var graphData = formatData(this.history.redo());
        this.clearSelectElements();
        this.graphModel.graphDataToModel(graphData);
    };
    /**
     * 放大缩小图形
     * @param zoomSize 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小
     * @param point 缩放的原点
     * @returns {string} -放大缩小的比例
     */
    LogicFlow.prototype.zoom = function (zoomSize, point) {
        var transformModel = this.graphModel.transformModel;
        return transformModel.zoom(zoomSize, point);
    };
    /**
     * 重置图形的放大缩写比例为默认
     */
    LogicFlow.prototype.resetZoom = function () {
        var transformModel = this.graphModel.transformModel;
        transformModel.resetZoom();
    };
    /**
     * 设置图形缩小时，能缩放到的最小倍数。参数为0-1自己。默认0.2
     * @param size 图形缩小的最小值
     */
    LogicFlow.prototype.setZoomMiniSize = function (size) {
        var transformModel = this.graphModel.transformModel;
        transformModel.setZoomMiniSize(size);
    };
    /**
     * 设置图形放大时，能放大到的最大倍数，默认16
     * @param size 图形放大的最大值
     */
    LogicFlow.prototype.setZoomMaxSize = function (size) {
        var transformModel = this.graphModel.transformModel;
        transformModel.setZoomMaxSize(size);
    };
    /**
     * 获取缩放的值和平移的值。
     */
    LogicFlow.prototype.getTransform = function () {
        var _a = this.graphModel.transformModel, SCALE_X = _a.SCALE_X, SCALE_Y = _a.SCALE_Y, TRANSLATE_X = _a.TRANSLATE_X, TRANSLATE_Y = _a.TRANSLATE_Y;
        return {
            SCALE_X: SCALE_X,
            SCALE_Y: SCALE_Y,
            TRANSLATE_X: TRANSLATE_X,
            TRANSLATE_Y: TRANSLATE_Y,
        };
    };
    /**
     * 平移图
     * @param x 向x轴移动距离
     * @param y 向y轴移动距离
     */
    LogicFlow.prototype.translate = function (x, y) {
        var transformModel = this.graphModel.transformModel;
        transformModel.translate(x, y);
    };
    /**
     * 还原图形为初始位置
     */
    LogicFlow.prototype.resetTranslate = function () {
        var transformModel = this.graphModel.transformModel;
        var TRANSLATE_X = transformModel.TRANSLATE_X, TRANSLATE_Y = transformModel.TRANSLATE_Y;
        this.translate(-TRANSLATE_X, -TRANSLATE_Y);
    };
    /**
     * 图形画布居中显示
     */
    LogicFlow.prototype.translateCenter = function () {
        this.graphModel.translateCenter();
    };
    /**
     * 图形适应屏幕大小
     * @param verticalOffset number 距离盒子上下的距离， 默认为20
     * @param horizontalOffset number 距离盒子左右的距离， 默认为20
     */
    LogicFlow.prototype.fitView = function (verticalOffset, horizontalOffset) {
        if (horizontalOffset === undefined) {
            horizontalOffset = verticalOffset; // 兼容以前的只传一个参数的情况
        }
        this.graphModel.fitView(verticalOffset, horizontalOffset);
    };
    /**
     * 开启边的动画
     * @param edgeId any
     */
    LogicFlow.prototype.openEdgeAnimation = function (edgeId) {
        this.graphModel.openEdgeAnimation(edgeId);
    };
    /**
     * 关闭边的动画
     * @param edgeId any
     */
    LogicFlow.prototype.closeEdgeAnimation = function (edgeId) {
        this.graphModel.closeEdgeAnimation(edgeId);
    };
    // 事件系统----------------------------------------------
    /**
     * 监听事件
     * 事件详情见 @see todo
     * 支持同时监听多个事件
     * @example
     * lf.on('node:click,node:contextmenu', (data) => {
     * });
     */
    LogicFlow.prototype.on = function (evt, callback) {
        this.graphModel.eventCenter.on(evt, callback);
    };
    /**
     * 撤销监听事件
     */
    LogicFlow.prototype.off = function (evt, callback) {
        this.graphModel.eventCenter.off(evt, callback);
    };
    /**
     * 监听事件，只监听一次
     */
    LogicFlow.prototype.once = function (evt, callback) {
        this.graphModel.eventCenter.once(evt, callback);
    };
    /**
     * 触发监听事件
     */
    LogicFlow.prototype.emit = function (evt, arg) {
        this.graphModel.eventCenter.emit(evt, arg);
    };
    // 插件系统----------------------------------------------
    /**
     * 添加扩展, 待讨论，这里是不是静态方法好一些？
     * 重复添加插件的时候，把上一次添加的插件的销毁。
     * @param plugin 插件
     */
    LogicFlow.use = function (extension) {
        var pluginName = extension.pluginName;
        if (!pluginName) {
            console.warn("\u8BF7\u7ED9\u63D2\u4EF6" + (extension.name || extension.constructor.name) + "\u6307\u5B9ApluginName!");
            pluginName = extension.name; // 兼容以前name的情况，1.0版本去掉。
        }
        var preExtension = this.extensions.get(pluginName);
        preExtension && preExtension.destroy && preExtension.destroy();
        this.extensions.set(pluginName, extension);
    };
    LogicFlow.prototype.installPlugins = function (disabledPlugins) {
        var _this = this;
        if (disabledPlugins === void 0) { disabledPlugins = []; }
        var _a;
        // 安装插件，优先使用个性插件
        var extensions = (_a = this.plugins) !== null && _a !== void 0 ? _a : LogicFlow.extensions;
        extensions.forEach(function (extension) {
            var pluginName = extension.pluginName || extension.name;
            if (disabledPlugins.indexOf(pluginName) === -1) {
                _this.installPlugin(extension);
            }
        });
    };
    /**
     * 加载插件-内部方法
     */
    LogicFlow.prototype.installPlugin = function (extension) {
        if (typeof extension === 'object') {
            var install = extension.install, renderComponent = extension.render;
            install && install.call(extension, this, LogicFlow);
            renderComponent && this.components.push(renderComponent.bind(extension));
            this.extension[extension.pluginName] = extension;
            return;
        }
        var ExtensionContructor = extension;
        var extensionInstance = new ExtensionContructor({
            lf: this,
            LogicFlow: LogicFlow,
        });
        extensionInstance.render && this.components.push(extensionInstance.render.bind(extensionInstance));
        this.extension[ExtensionContructor.pluginName] = extensionInstance;
    };
    /**
     * 修改对应元素 model 中的属性
     * 注意：此方法慎用，除非您对logicflow内部有足够的了解。
     * 大多数情况下，请使用setProperties、updateText、changeNodeId等方法。
     * 例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
     * @param {string} id 元素id
     * @param {object} attributes 需要更新的属性
     */
    LogicFlow.prototype.updateAttributes = function (id, attributes) {
        this.graphModel.updateAttributes(id, attributes);
    };
    /**
     * 内部保留方法
     * 创建一个fakerNode，用于dnd插件拖动节点进画布的时候使用。
     */
    LogicFlow.prototype.createFakerNode = function (nodeConfig) {
        var Model = this.graphModel.modelMap.get(nodeConfig.type);
        if (!Model) {
            console.warn("\u4E0D\u5B58\u5728\u4E3A" + nodeConfig.type + "\u7C7B\u578B\u7684\u8282\u70B9");
            return;
        }
        // * initNodeData区分是否为虚拟节点
        var fakerNodeModel = new Model(__assign(__assign({}, nodeConfig), { virtual: true }), this.graphModel);
        this.graphModel.setFakerNode(fakerNodeModel);
        return fakerNodeModel;
    };
    /**
     * 内部保留方法
     * 移除fakerNode
     */
    LogicFlow.prototype.removeFakerNode = function () {
        this.graphModel.removeFakerNode();
    };
    /**
     * 内部保留方法
     * 用于fakerNode显示对齐线
     */
    LogicFlow.prototype.setNodeSnapLine = function (data) {
        if (this.snaplineModel) {
            this.snaplineModel.setNodeSnapLine(data);
        }
    };
    /**
     * 内部保留方法
     * 用于fakerNode移除对齐线
     */
    LogicFlow.prototype.removeNodeSnapLine = function () {
        if (this.snaplineModel) {
            this.snaplineModel.clearSnapline();
        }
    };
    /**
     * 内部保留方法
     * 用于fakerNode移除对齐线
     */
    LogicFlow.prototype.setView = function (type, component) {
        this.viewMap.set(type, component);
    };
    LogicFlow.prototype.renderRawData = function (graphRawData) {
        this.graphModel.graphDataToModel(formatData(graphRawData));
        if (!this.options.isSilentMode && this.options.history !== false) {
            this.history.watch(this.graphModel);
        }
        render((h(Graph, { getView: this.getView, tool: this.tool, options: this.options, dnd: this.dnd, snaplineModel: this.snaplineModel, graphModel: this.graphModel })), this.container);
        this.emit(EventType.GRAPH_RENDERED, this.graphModel.modelToGraphData());
    };
    /**
     * 渲染图
     * @example
     * lf.render({
     *   nodes: [
     *     {
     *       id: 'node_1',
     *       type: 'rect',
     *       x: 100,
     *       y: 100
     *     },
     *     {
     *       id: 'node_2',
     *       type: 'circel',
     *       x: 300,
     *       y: 200
     *     }
     *   ],
     *   edges: [
     *     {
     *       sourceNodeId: 'node_1',
     *       targetNodeId: 'node_2',
     *       type: 'polyline'
     *     }
     *   ]
     * })
     * @param graphData 图数据
     */
    LogicFlow.prototype.render = function (graphData) {
        if (graphData === void 0) { graphData = {}; }
        if (this.adapterIn) {
            graphData = this.adapterIn(graphData);
        }
        this.renderRawData(graphData);
    };
    /**
     * 全局配置的插件，所有的LogicFlow示例都会使用
     */
    LogicFlow.extensions = new Map();
    return LogicFlow;
}());
export default LogicFlow;
