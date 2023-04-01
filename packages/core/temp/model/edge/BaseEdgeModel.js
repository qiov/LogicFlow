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
import { action, observable, computed, toJS, } from 'mobx';
import { assign, cloneDeep } from 'lodash-es';
import { createUuid } from '../../util/uuid';
import { getAnchors } from '../../util/node';
import { ModelType, ElementType, OverlapMode, } from '../../constant/constant';
import { defaultAnimationData } from '../../constant/DefaultAnimation';
import { formatData } from '../../util/compatible';
import { pickEdgeConfig, twoPointDistance } from '../../util/edge';
import { getZIndex } from '../../util/zIndex';
var BaseEdgeModel = /** @class */ (function () {
    function BaseEdgeModel(data, graphModel) {
        // 数据属性
        this.id = createUuid();
        this.type = '';
        this.sourceNodeId = '';
        this.targetNodeId = '';
        this.startPoint = null;
        this.endPoint = null;
        this.text = {
            value: '',
            x: 0,
            y: 0,
            draggable: false,
            editable: true,
        };
        this.properties = {};
        this.points = '';
        this.pointsList = [];
        // 状态属性
        this.isSelected = false;
        this.isHovered = false;
        this.isHitable = true; // 细粒度控制边是否对用户操作进行反应
        this.draggable = true;
        this.visible = true;
        this.virtual = false;
        this.isAnimation = false;
        this.zIndex = 0;
        this.BaseType = ElementType.EDGE;
        this.modelType = ModelType.EDGE;
        this.state = 1;
        this.sourceAnchorId = '';
        this.targetAnchorId = '';
        this.customTextPosition = false; // 是否自定义边文本位置
        this.animationData = defaultAnimationData;
        this.style = {}; // 每条边自己的样式，动态修改
        // TODO: 每个边独立生成一个marker没必要
        this.arrowConfig = {
            markerEnd: "url(#marker-end-" + this.id + ")",
            markerStart: '',
        }; // 箭头属性
        this.graphModel = graphModel;
        this.initEdgeData(data);
        this.setAttributes();
    }
    /**
     * @overridable 支持重写
     * 初始化边数据
     * initNodeData和setAttributes的区别在于
     * initNodeData只在节点初始化的时候调用，用于初始化节点的所有属性。
     * setAttributes除了初始化调用外，还会在properties发生变化了调用。
     */
    BaseEdgeModel.prototype.initEdgeData = function (data) {
        if (!data.properties) {
            data.properties = {};
        }
        if (!data.id) {
            // 自定义边id > 全局定义边id > 内置
            var idGenerator = this.graphModel.idGenerator;
            var globalId = idGenerator && idGenerator(data.type);
            if (globalId)
                data.id = globalId;
            var nodeId = this.createId();
            if (nodeId)
                data.id = nodeId;
        }
        assign(this, pickEdgeConfig(data));
        var overlapMode = this.graphModel.overlapMode;
        if (overlapMode === OverlapMode.INCREASE) {
            this.zIndex = data.zIndex || getZIndex();
        }
        // 设置边的 anchors，也就是边的两个端点
        // 端点依赖于 edgeData 的 sourceNode 和 targetNode
        this.setAnchors();
        // 边的拐点依赖于两个端点
        this.initPoints();
        // 文本位置依赖于边上的所有拐点
        this.formatText(data);
    };
    /**
     * 设置model属性，每次properties发生变化会触发
     * @overridable 支持重写
     */
    BaseEdgeModel.prototype.setAttributes = function () { };
    /**
     * @overridable 支持重写，自定义此类型节点默认生成方式
     * @returns string
     */
    BaseEdgeModel.prototype.createId = function () {
        return null;
    };
    /**
     * @overridable 支持重写
     * 获取当前节点样式
     * @returns 自定义边样式
     */
    BaseEdgeModel.prototype.getEdgeStyle = function () {
        return __assign(__assign({}, this.graphModel.theme.baseEdge), this.style);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点文本样式
     */
    BaseEdgeModel.prototype.getTextStyle = function () {
        // 透传 edgeText
        var edgeText = this.graphModel.theme.edgeText;
        return cloneDeep(edgeText);
    };
    /**
     * @overridable 支持重写
     * 获取当前边的动画样式
     * @returns 自定义边动画样式
     */
    BaseEdgeModel.prototype.getAnimation = function () {
        var animationData = this.animationData;
        return cloneDeep(animationData);
    };
    /**
     * @overridable 支持重写
     * 获取当前边的动画样式
     * @returns 自定义边动画样式
     */
    BaseEdgeModel.prototype.getEdgeAnimationStyle = function () {
        var edgeAnimation = this.graphModel.theme.edgeAnimation;
        return cloneDeep(edgeAnimation);
    };
    /**
     * @overridable 支持重写
     * 获取outline样式，重写可以定义此类型边outline样式， 默认使用主题样式
     * @returns 自定义outline样式
     */
    BaseEdgeModel.prototype.getOutlineStyle = function () {
        var graphModel = this.graphModel;
        var outline = graphModel.theme.outline;
        return cloneDeep(outline);
    };
    /**
     * @overridable 支持重新，重新自定义文本位置
     * @returns 文本位置
     */
    BaseEdgeModel.prototype.getTextPosition = function () {
        return {
            x: 0,
            y: 0,
        };
    };
    Object.defineProperty(BaseEdgeModel.prototype, "sourceNode", {
        get: function () {
            var _a, _b;
            return (_b = (_a = this.graphModel) === null || _a === void 0 ? void 0 : _a.nodesMap[this.sourceNodeId]) === null || _b === void 0 ? void 0 : _b.model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseEdgeModel.prototype, "targetNode", {
        get: function () {
            var _a, _b;
            return (_b = (_a = this.graphModel) === null || _a === void 0 ? void 0 : _a.nodesMap[this.targetNodeId]) === null || _b === void 0 ? void 0 : _b.model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseEdgeModel.prototype, "textPosition", {
        get: function () {
            return this.getTextPosition();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 内部方法，计算两个节点相连是起点位置
     */
    BaseEdgeModel.prototype.getBeginAnchor = function (sourceNode, targetNode) {
        var position;
        var minDistance;
        var sourceAnchors = getAnchors(sourceNode);
        sourceAnchors.forEach(function (anchor) {
            var distance = twoPointDistance(anchor, targetNode);
            if (!minDistance) {
                minDistance = distance;
                position = anchor;
            }
            else if (distance < minDistance) {
                minDistance = distance;
                position = anchor;
            }
        });
        return position;
    };
    /**
     * 内部方法，计算两个节点相连是终点位置
     */
    BaseEdgeModel.prototype.getEndAnchor = function (targetNode) {
        var _this = this;
        var position;
        var minDistance;
        var targetAnchors = getAnchors(targetNode);
        targetAnchors.forEach(function (anchor) {
            var distance = twoPointDistance(anchor, _this.startPoint);
            if (!minDistance) {
                minDistance = distance;
                position = anchor;
            }
            else if (distance < minDistance) {
                minDistance = distance;
                position = anchor;
            }
        });
        return position;
    };
    /**
     * 获取当前边的properties
     */
    BaseEdgeModel.prototype.getProperties = function () {
        return toJS(this.properties);
    };
    /**
     * 获取被保存时返回的数据
     */
    BaseEdgeModel.prototype.getData = function () {
        var _a = this.text, x = _a.x, y = _a.y, value = _a.value;
        var data = {
            id: this.id,
            type: this.type,
            sourceNodeId: this.sourceNode.id,
            targetNodeId: this.targetNode.id,
            startPoint: Object.assign({}, this.startPoint),
            endPoint: Object.assign({}, this.endPoint),
            properties: toJS(this.properties),
        };
        if (value) {
            data.text = {
                x: x,
                y: y,
                value: value,
            };
        }
        if (this.graphModel.overlapMode === OverlapMode.INCREASE) {
            data.zIndex = this.zIndex;
        }
        return data;
    };
    /**
     * 用于在历史记录时获取节点数据，
     * 在某些情况下，如果希望某个属性变化不引起history的变化，
     * 可以重写此方法。
     */
    BaseEdgeModel.prototype.getHistoryData = function () {
        return this.getData();
    };
    BaseEdgeModel.prototype.setProperty = function (key, val) {
        this.properties[key] = formatData(val);
        this.setAttributes();
    };
    BaseEdgeModel.prototype.deleteProperty = function (key) {
        delete this.properties[key];
        this.setAttributes();
    };
    BaseEdgeModel.prototype.setProperties = function (properties) {
        this.properties = __assign(__assign({}, this.properties), formatData(properties));
        this.setAttributes();
    };
    BaseEdgeModel.prototype.changeEdgeId = function (id) {
        var _a = this.arrowConfig, markerEnd = _a.markerEnd, markerStart = _a.markerStart;
        if (markerStart && markerStart === "url(#marker-start-" + this.id + ")") {
            this.arrowConfig.markerStart = "url(#marker-start-" + id + ")";
        }
        if (markerEnd && markerEnd === "url(#marker-end-" + this.id + ")") {
            this.arrowConfig.markerEnd = "url(#marker-end-" + id + ")";
        }
        this.id = id;
    };
    // 设置样式
    BaseEdgeModel.prototype.setStyle = function (key, val) {
        var _a;
        this.style = __assign(__assign({}, this.style), (_a = {}, _a[key] = formatData(val), _a));
    };
    BaseEdgeModel.prototype.setStyles = function (styles) {
        this.style = __assign(__assign({}, this.style), formatData(styles));
    };
    BaseEdgeModel.prototype.updateStyles = function (styles) {
        this.style = __assign({}, formatData(styles));
    };
    /**
     * 内部方法，处理初始化文本格式
     */
    BaseEdgeModel.prototype.formatText = function (data) {
        // 暂时处理，只传入text的情况
        var _a = this.textPosition, x = _a.x, y = _a.y;
        if (!data.text || typeof data.text === 'string') {
            this.text = {
                value: data.text || '',
                x: x,
                y: y,
                draggable: this.text.draggable,
                editable: this.text.editable,
            };
            return;
        }
        if (Object.prototype.toString.call(data.text) === '[object Object]') {
            this.text = {
                x: data.text.x || x,
                y: data.text.y || y,
                value: data.text.value || '',
                draggable: this.text.draggable,
                editable: this.text.editable,
            };
        }
    };
    /**
     * 重置文本位置
     */
    BaseEdgeModel.prototype.resetTextPosition = function () {
        var _a = this.textPosition, x = _a.x, y = _a.y;
        this.text.x = x;
        this.text.y = y;
    };
    /**
     * 移动边上的文本
     */
    BaseEdgeModel.prototype.moveText = function (deltaX, deltaY) {
        if (this.text) {
            var _a = this.text, x = _a.x, y = _a.y, value = _a.value, draggable = _a.draggable, editable = _a.editable;
            this.text = {
                value: value,
                draggable: draggable,
                x: x + deltaX,
                y: y + deltaY,
                editable: editable,
            };
        }
    };
    /**
     * 设置文本位置和值
     */
    BaseEdgeModel.prototype.setText = function (textConfig) {
        if (textConfig) {
            assign(this.text, textConfig);
        }
    };
    /**
     * 更新文本的值
     */
    BaseEdgeModel.prototype.updateText = function (value) {
        this.text = __assign(__assign({}, this.text), { value: value });
    };
    /**
     * 内部方法，计算边的起点和终点和其对于的锚点Id
     */
    BaseEdgeModel.prototype.setAnchors = function () {
        if (!this.sourceAnchorId || !this.startPoint) {
            var anchor = this.getBeginAnchor(this.sourceNode, this.targetNode);
            if (!this.startPoint) {
                this.startPoint = {
                    x: anchor.x,
                    y: anchor.y,
                };
            }
            if (!this.sourceAnchorId) {
                this.sourceAnchorId = anchor.id;
            }
        }
        if (!this.targetAnchorId || !this.endPoint) {
            var anchor = this.getEndAnchor(this.targetNode);
            if (!this.endPoint) {
                this.endPoint = {
                    x: anchor.x,
                    y: anchor.y,
                };
            }
            if (!this.targetAnchorId) {
                this.targetAnchorId = anchor.id;
            }
        }
    };
    BaseEdgeModel.prototype.setSelected = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isSelected = flag;
    };
    BaseEdgeModel.prototype.setHovered = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHovered = flag;
    };
    BaseEdgeModel.prototype.setHitable = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHitable = flag;
    };
    BaseEdgeModel.prototype.openEdgeAnimation = function () {
        this.isAnimation = true;
    };
    BaseEdgeModel.prototype.closeEdgeAnimation = function () {
        this.isAnimation = false;
    };
    BaseEdgeModel.prototype.setElementState = function (state, additionStateData) {
        this.state = state;
        this.additionStateData = additionStateData;
    };
    BaseEdgeModel.prototype.updateStartPoint = function (anchor) {
        this.startPoint = anchor;
    };
    BaseEdgeModel.prototype.moveStartPoint = function (deltaX, deltaY) {
        this.startPoint.x += deltaX;
        this.startPoint.y += deltaY;
    };
    BaseEdgeModel.prototype.updateEndPoint = function (anchor) {
        this.endPoint = anchor;
    };
    BaseEdgeModel.prototype.moveEndPoint = function (deltaX, deltaY) {
        this.endPoint.x += deltaX;
        this.endPoint.y += deltaY;
    };
    BaseEdgeModel.prototype.setZIndex = function (zindex) {
        if (zindex === void 0) { zindex = 0; }
        this.zIndex = zindex;
    };
    BaseEdgeModel.prototype.initPoints = function () { };
    BaseEdgeModel.prototype.updateAttributes = function (attributes) {
        assign(this, attributes);
    };
    // 获取边调整的起点
    BaseEdgeModel.prototype.getAdjustStart = function () {
        return this.startPoint;
    };
    // 获取边调整的终点
    BaseEdgeModel.prototype.getAdjustEnd = function () {
        return this.endPoint;
    };
    // 起终点拖拽调整过程中，进行直线路径更新
    BaseEdgeModel.prototype.updateAfterAdjustStartAndEnd = function (_a) {
        var startPoint = _a.startPoint, endPoint = _a.endPoint;
        this.updateStartPoint({ x: startPoint.x, y: startPoint.y });
        this.updateEndPoint({ x: endPoint.x, y: endPoint.y });
    };
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "type", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "sourceNodeId", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "targetNodeId", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "startPoint", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "endPoint", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "text", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "properties", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "points", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "pointsList", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "isSelected", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "isHovered", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "isHitable", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "draggable", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "visible", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "isAnimation", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "zIndex", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "state", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "style", void 0);
    __decorate([
        observable
    ], BaseEdgeModel.prototype, "arrowConfig", void 0);
    __decorate([
        computed
    ], BaseEdgeModel.prototype, "sourceNode", null);
    __decorate([
        computed
    ], BaseEdgeModel.prototype, "targetNode", null);
    __decorate([
        computed
    ], BaseEdgeModel.prototype, "textPosition", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setProperty", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "deleteProperty", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setProperties", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "changeEdgeId", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setStyle", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setStyles", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "updateStyles", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "formatText", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "resetTextPosition", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "moveText", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setText", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "updateText", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setAnchors", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setSelected", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setHovered", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setHitable", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "openEdgeAnimation", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "closeEdgeAnimation", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setElementState", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "updateStartPoint", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "moveStartPoint", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "updateEndPoint", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "moveEndPoint", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "setZIndex", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "initPoints", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "updateAttributes", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "getAdjustStart", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "getAdjustEnd", null);
    __decorate([
        action
    ], BaseEdgeModel.prototype, "updateAfterAdjustStartAndEnd", null);
    return BaseEdgeModel;
}());
export { BaseEdgeModel };
export default BaseEdgeModel;
