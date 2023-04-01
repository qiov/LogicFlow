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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { observable, action, toJS, isObservable, computed, } from 'mobx';
import { assign, cloneDeep, isNil } from 'lodash-es';
import { createUuid } from '../../util/uuid';
import { ModelType, ElementType, OverlapMode, } from '../../constant/constant';
import { formatData } from '../../util/compatible';
import { pickNodeConfig } from '../../util/node';
import { getZIndex } from '../../util/zIndex';
export { BaseNodeModel };
var BaseNodeModel = /** @class */ (function () {
    function BaseNodeModel(data, graphModel) {
        // 数据属性
        this.id = createUuid();
        this.type = '';
        this.x = 0;
        this.y = 0;
        this.text = {
            value: '',
            x: 0,
            y: 0,
            draggable: false,
            editable: true,
        };
        this.properties = {};
        // 形状属性
        this._width = 100;
        this._height = 80;
        this.anchorsOffset = []; // 根据与(x, y)的偏移量计算anchors的坐标
        // 状态属性
        this.isSelected = false;
        this.isHovered = false;
        this.isShowAnchor = false;
        this.isDragging = false;
        this.isHitable = true; // 细粒度控制节点是否对用户操作进行反应
        this.draggable = true;
        this.visible = true;
        this.virtual = false;
        this.zIndex = 1;
        this.state = 1;
        this.autoToFront = true; // 节点选中时是否自动置顶，默认为true.
        this.style = {}; // 每个节点自己的样式，动态修改
        this.BaseType = ElementType.NODE;
        this.modelType = ModelType.NODE;
        this.targetRules = [];
        this.sourceRules = [];
        this.moveRules = []; // 节点移动之前的hook
        this.hasSetTargetRules = false; // 用来限制rules的重复值
        this.hasSetSourceRules = false; // 用来限制rules的重复值
        this.graphModel = graphModel;
        this.initNodeData(data);
        this.setAttributes();
    }
    Object.defineProperty(BaseNodeModel.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            this._width = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseNodeModel.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            this._height = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseNodeModel.prototype, "incoming", {
        /**
         * 获取进入当前节点的边和节点
         */
        get: function () {
            return {
                nodes: this.graphModel.getNodeIncomingNode(this.id),
                edges: this.graphModel.getNodeIncomingEdge(this.id),
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseNodeModel.prototype, "outgoing", {
        /*
         * 获取离开当前节点的边和节点
         */
        get: function () {
            return {
                nodes: this.graphModel.getNodeOutgoingNode(this.id),
                edges: this.graphModel.getNodeOutgoingEdge(this.id),
            };
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @overridable 可以重写
     * 初始化节点数据
     * initNodeData和setAttributes的区别在于
     * initNodeData只在节点初始化的时候调用，用于初始化节点的所有属性。
     * setAttributes除了初始化调用外，还会在properties发生变化了调用。
     */
    BaseNodeModel.prototype.initNodeData = function (data) {
        if (!data.properties) {
            data.properties = {};
        }
        if (!data.id) {
            // 自定义节点id > 全局定义id > 内置
            var idGenerator = this.graphModel.idGenerator;
            var globalId = idGenerator && idGenerator(data.type);
            if (globalId)
                data.id = globalId;
            var customNodeId = this.createId();
            if (customNodeId)
                data.id = customNodeId;
        }
        this.formatText(data);
        assign(this, pickNodeConfig(data));
        var overlapMode = this.graphModel.overlapMode;
        if (overlapMode === OverlapMode.INCREASE) {
            this.zIndex = data.zIndex || getZIndex();
        }
    };
    /**
     * 设置model属性，每次properties发生变化会触发
     * 例如设置节点的宽度
     * @example
     *
     * setAttributes () {
     *   this.width = 300
     *   this.height = 200
     * }
     *
     * @overridable 支持重写
     */
    BaseNodeModel.prototype.setAttributes = function () { };
    /**
     * @overridable 支持重写，自定义此类型节点默认生成方式
     * @returns string
     */
    BaseNodeModel.prototype.createId = function () {
        return null;
    };
    /**
     * 初始化文本属性
     */
    BaseNodeModel.prototype.formatText = function (data) {
        if (!data.text) {
            data.text = {
                value: '',
                x: data.x,
                y: data.y,
                draggable: false,
                editable: true,
            };
        }
        if (data.text && typeof data.text === 'string') {
            data.text = {
                value: data.text,
                x: data.x,
                y: data.y,
                draggable: false,
                editable: true,
            };
        }
        else if (data.text && data.text.editable === undefined) {
            data.text.editable = true;
        }
    };
    /**
     * 获取被保存时返回的数据
     * @overridable 支持重写
     */
    BaseNodeModel.prototype.getData = function () {
        var _a = this.text, x = _a.x, y = _a.y, value = _a.value;
        var properties = this.properties;
        if (isObservable(properties)) {
            properties = toJS(properties);
        }
        var data = {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            properties: properties,
        };
        if (this.graphModel.overlapMode === OverlapMode.INCREASE) {
            data.zIndex = this.zIndex;
        }
        if (value) {
            data.text = {
                x: x,
                y: y,
                value: value,
            };
        }
        return data;
    };
    /**
     * 用于在历史记录时获取节点数据，
     * 在某些情况下，如果希望某个属性变化不引起history的变化，
     * 可以重写此方法。
     */
    BaseNodeModel.prototype.getHistoryData = function () {
        return this.getData();
    };
    /**
     * 获取当前节点的properties
     */
    BaseNodeModel.prototype.getProperties = function () {
        return toJS(this.properties);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点样式
     * @returns 自定义节点样式
     */
    BaseNodeModel.prototype.getNodeStyle = function () {
        return __assign(__assign({}, this.graphModel.theme.baseNode), this.style);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点文本样式
     */
    BaseNodeModel.prototype.getTextStyle = function () {
        // 透传 nodeText
        var nodeText = this.graphModel.theme.nodeText;
        return cloneDeep(nodeText);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点锚点样式
     * @returns 自定义样式
     */
    BaseNodeModel.prototype.getAnchorStyle = function (anchorInfo) {
        var anchor = this.graphModel.theme.anchor;
        // 防止被重写覆盖主题。
        return cloneDeep(anchor);
    };
    /**
     * @overridable 支持重写
     * 获取当前节点锚点拖出连线样式
     * @returns 自定义锚点拖出样式
     */
    BaseNodeModel.prototype.getAnchorLineStyle = function (anchorInfo) {
        var anchorLine = this.graphModel.theme.anchorLine;
        return cloneDeep(anchorLine);
    };
    /**
     * @overridable 支持重写
     * 获取outline样式，重写可以定义此类型节点outline样式， 默认使用主题样式
     * @returns 自定义outline样式
     */
    BaseNodeModel.prototype.getOutlineStyle = function () {
        var outline = this.graphModel.theme.outline;
        return cloneDeep(outline);
    };
    /**
     * @over
     * 在边的时候，是否允许这个节点为source节点，边到target节点。
     */
    BaseNodeModel.prototype.isAllowConnectedAsSource = function (target, soureAnchor, targetAnchor) {
        var rules = !this.hasSetSourceRules
            ? this.getConnectedSourceRules()
            : this.sourceRules;
        this.hasSetSourceRules = true;
        var isAllPass = true;
        var msg;
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (!rule.validate.call(this, this, target, soureAnchor, targetAnchor)) {
                isAllPass = false;
                msg = rule.message;
                break;
            }
        }
        return {
            isAllPass: isAllPass,
            msg: msg,
        };
    };
    /**
     * 获取当前节点作为连接的起始节点规则。
     */
    BaseNodeModel.prototype.getConnectedSourceRules = function () {
        return this.sourceRules;
    };
    /**
     * 在连线的时候，是否允许这个节点为target节点
     */
    BaseNodeModel.prototype.isAllowConnectedAsTarget = function (source, soureAnchor, targetAnchor) {
        var rules = !this.hasSetTargetRules
            ? this.getConnectedTargetRules()
            : this.targetRules;
        this.hasSetTargetRules = true;
        var isAllPass = true;
        var msg;
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (!rule.validate.call(this, source, this, soureAnchor, targetAnchor)) {
                isAllPass = false;
                msg = rule.message;
                break;
            }
        }
        return {
            isAllPass: isAllPass,
            msg: msg,
        };
    };
    /**
     * 内部方法
     * 是否允许移动节点到新的位置
     */
    BaseNodeModel.prototype.isAllowMoveNode = function (deltaX, deltaY) {
        var e_1, _a;
        var isAllowMoveX = true;
        var isAllowMoveY = true;
        var rules = this.moveRules.concat(this.graphModel.nodeMoveRules);
        try {
            for (var rules_1 = __values(rules), rules_1_1 = rules_1.next(); !rules_1_1.done; rules_1_1 = rules_1.next()) {
                var rule = rules_1_1.value;
                var r = rule(this, deltaX, deltaY);
                if (!r)
                    return false;
                if (typeof r === 'object') {
                    var r1 = r;
                    if (r1.x === false && r1.y === false) {
                        return false;
                    }
                    isAllowMoveX = isAllowMoveX && r1.x;
                    isAllowMoveY = isAllowMoveY && r1.y;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rules_1_1 && !rules_1_1.done && (_a = rules_1.return)) _a.call(rules_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return {
            x: isAllowMoveX,
            y: isAllowMoveY,
        };
    };
    /**
     * 获取作为连线终点时的所有规则。
     */
    BaseNodeModel.prototype.getConnectedTargetRules = function () {
        return this.targetRules;
    };
    /**
     * @returns Point[] 锚点坐标构成的数组
     */
    BaseNodeModel.prototype.getAnchorsByOffset = function () {
        var _a = this, anchorsOffset = _a.anchorsOffset, id = _a.id, x = _a.x, y = _a.y;
        if (anchorsOffset && anchorsOffset.length > 0) {
            return anchorsOffset.map(function (el, idx) {
                if (el.length) {
                    el = el; // 历史数据格式
                    return {
                        id: id + "_" + idx,
                        x: x + el[0],
                        y: y + el[1],
                    };
                }
                el = el;
                return __assign(__assign({}, el), { x: x + el.x, y: y + el.y, id: el.id || id + "_" + idx });
            });
        }
        return this.getDefaultAnchor();
    };
    /**
     * @overridable 子类重写此方法设置默认锚点
     * 获取节点默认情况下的锚点
     */
    BaseNodeModel.prototype.getDefaultAnchor = function () {
        return [];
    };
    /**
     * 获取节点BBox
     */
    BaseNodeModel.prototype.getBounds = function () {
        return {
            x1: this.x - this.width / 2,
            y1: this.y - this.height / 2,
            x2: this.x + this.width / 2,
            y2: this.y + this.height / 2,
        };
    };
    Object.defineProperty(BaseNodeModel.prototype, "anchors", {
        get: function () {
            return this.getAnchorsByOffset();
        },
        enumerable: true,
        configurable: true
    });
    BaseNodeModel.prototype.getAnchorInfo = function (anchorId) {
        if (isNil(anchorId))
            return;
        for (var i = 0; i < this.anchors.length; i++) {
            var anchor = this.anchors[i];
            if (anchor.id === anchorId) {
                return anchor;
            }
        }
    };
    BaseNodeModel.prototype.addNodeMoveRules = function (fn) {
        if (!this.moveRules.includes(fn)) {
            this.moveRules.push(fn);
        }
    };
    BaseNodeModel.prototype.move = function (deltaX, deltaY, isIgnoreRule) {
        if (isIgnoreRule === void 0) { isIgnoreRule = false; }
        var isAllowMoveX = false;
        var isAllowMoveY = false;
        if (isIgnoreRule) {
            isAllowMoveX = true;
            isAllowMoveY = true;
        }
        else {
            var r = this.isAllowMoveNode(deltaX, deltaY);
            if (typeof r === 'boolean') {
                isAllowMoveX = r;
                isAllowMoveY = r;
            }
            else {
                isAllowMoveX = r.x;
                isAllowMoveY = r.y;
            }
        }
        if (isAllowMoveX) {
            var targetX = this.x + deltaX;
            this.x = targetX;
            this.text && this.moveText(deltaX, 0);
        }
        if (isAllowMoveY) {
            var targetY = this.y + deltaY;
            this.y = targetY;
            this.text && this.moveText(0, deltaY);
        }
        return isAllowMoveX || isAllowMoveY;
    };
    BaseNodeModel.prototype.getMoveDistance = function (deltaX, deltaY, isIgnoreRule) {
        if (isIgnoreRule === void 0) { isIgnoreRule = false; }
        var isAllowMoveX = false;
        var isAllowMoveY = false;
        var moveX = 0;
        var moveY = 0;
        if (isIgnoreRule) {
            isAllowMoveX = true;
            isAllowMoveY = true;
        }
        else {
            var r = this.isAllowMoveNode(deltaX, deltaY);
            if (typeof r === 'boolean') {
                isAllowMoveX = r;
                isAllowMoveY = r;
            }
            else {
                isAllowMoveX = r.x;
                isAllowMoveY = r.y;
            }
        }
        if (isAllowMoveX && deltaX) {
            var targetX = this.x + deltaX;
            this.x = targetX;
            this.text && this.moveText(deltaX, 0);
            moveX = deltaX;
        }
        if (isAllowMoveY && deltaY) {
            var targetY = this.y + deltaY;
            this.y = targetY;
            this.text && this.moveText(0, deltaY);
            moveY = deltaY;
        }
        return [moveX, moveY];
    };
    BaseNodeModel.prototype.moveTo = function (x, y, isIgnoreRule) {
        if (isIgnoreRule === void 0) { isIgnoreRule = false; }
        var deltaX = x - this.x;
        var deltaY = y - this.y;
        if (!isIgnoreRule && !this.isAllowMoveNode(deltaX, deltaY))
            return false;
        if (this.text) {
            this.text && this.moveText(deltaX, deltaY);
        }
        this.x = x;
        this.y = y;
        return true;
    };
    BaseNodeModel.prototype.moveText = function (deltaX, deltaY) {
        var _a = this.text, x = _a.x, y = _a.y, value = _a.value, draggable = _a.draggable, editable = _a.editable;
        this.text = {
            value: value,
            editable: editable,
            draggable: draggable,
            x: x + deltaX,
            y: y + deltaY,
        };
    };
    BaseNodeModel.prototype.updateText = function (value) {
        this.text = __assign(__assign({}, this.text), { value: value });
    };
    BaseNodeModel.prototype.setSelected = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isSelected = flag;
    };
    BaseNodeModel.prototype.setHovered = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHovered = flag;
        this.setIsShowAnchor(flag);
    };
    BaseNodeModel.prototype.setIsShowAnchor = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isShowAnchor = flag;
    };
    BaseNodeModel.prototype.setHitable = function (flag) {
        if (flag === void 0) { flag = true; }
        this.isHitable = flag;
    };
    BaseNodeModel.prototype.setElementState = function (state, additionStateData) {
        this.state = state;
        this.additionStateData = additionStateData;
    };
    BaseNodeModel.prototype.setProperty = function (key, val) {
        var _a;
        this.properties = __assign(__assign({}, this.properties), (_a = {}, _a[key] = formatData(val), _a));
        this.setAttributes();
    };
    BaseNodeModel.prototype.setProperties = function (properties) {
        this.properties = __assign(__assign({}, this.properties), formatData(properties));
        this.setAttributes();
    };
    BaseNodeModel.prototype.deleteProperty = function (key) {
        delete this.properties[key];
        this.setAttributes();
    };
    BaseNodeModel.prototype.setStyle = function (key, val) {
        var _a;
        this.style = __assign(__assign({}, this.style), (_a = {}, _a[key] = formatData(val), _a));
    };
    BaseNodeModel.prototype.setStyles = function (styles) {
        this.style = __assign(__assign({}, this.style), formatData(styles));
    };
    BaseNodeModel.prototype.updateStyles = function (styles) {
        this.style = __assign({}, formatData(styles));
    };
    BaseNodeModel.prototype.setZIndex = function (zindex) {
        if (zindex === void 0) { zindex = 1; }
        this.zIndex = zindex;
    };
    BaseNodeModel.prototype.updateAttributes = function (attributes) {
        assign(this, attributes);
    };
    __decorate([
        observable
    ], BaseNodeModel.prototype, "type", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "x", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "y", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "text", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "properties", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "_width", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "_height", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "anchorsOffset", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "isSelected", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "isHovered", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "isShowAnchor", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "isDragging", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "isHitable", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "draggable", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "visible", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "zIndex", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "state", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "autoToFront", void 0);
    __decorate([
        observable
    ], BaseNodeModel.prototype, "style", void 0);
    __decorate([
        computed
    ], BaseNodeModel.prototype, "incoming", null);
    __decorate([
        computed
    ], BaseNodeModel.prototype, "outgoing", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "addNodeMoveRules", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "move", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "getMoveDistance", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "moveTo", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "moveText", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "updateText", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setSelected", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setHovered", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setIsShowAnchor", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setHitable", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setElementState", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setProperty", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setProperties", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "deleteProperty", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setStyle", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setStyles", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "updateStyles", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "setZIndex", null);
    __decorate([
        action
    ], BaseNodeModel.prototype, "updateAttributes", null);
    return BaseNodeModel;
}());
export default BaseNodeModel;
