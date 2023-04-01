var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { h, Component } from 'preact';
import { StepDrag } from '../util/drag';
import { formateAnchorConnectValidateData, targetNodeInfo, distance } from '../util/node';
import Circle from './basic-shape/Circle';
import Line from './basic-shape/Line';
import { ElementState, EventType, OverlapMode } from '../constant/constant';
import { cancelRaf, createRaf } from '../util/raf';
var Anchor = /** @class */ (function (_super) {
    __extends(Anchor, _super);
    function Anchor() {
        var _this = _super.call(this) || this;
        _this.onDragStart = function (_a) {
            var event = _a.event;
            var _b = _this.props, anchorData = _b.anchorData, nodeModel = _b.nodeModel, graphModel = _b.graphModel;
            var overlapMode = graphModel.overlapMode;
            // nodeModel.setSelected(true);
            graphModel.selectNodeById(nodeModel.id);
            if (overlapMode !== OverlapMode.INCREASE && nodeModel.autoToFront) {
                graphModel.toFront(nodeModel.id);
            }
            graphModel.eventCenter.emit(EventType.ANCHOR_DRAGSTART, {
                data: anchorData,
                e: event,
                nodeModel: nodeModel,
            });
            _this.setState({
                startX: anchorData.x,
                startY: anchorData.y,
                endX: anchorData.x,
                endY: anchorData.y,
            });
        };
        _this.onDraging = function (_a) {
            var event = _a.event;
            var _b = _this.props, graphModel = _b.graphModel, nodeModel = _b.nodeModel, anchorData = _b.anchorData;
            var transformModel = graphModel.transformModel, eventCenter = graphModel.eventCenter, width = graphModel.width, height = graphModel.height, _c = graphModel.editConfigModel, autoExpand = _c.autoExpand, stopMoveGraph = _c.stopMoveGraph;
            var clientX = event.clientX, clientY = event.clientY;
            var _d = graphModel.getPointByClient({
                x: clientX,
                y: clientY,
            }), _e = _d.domOverlayPosition, x = _e.x, y = _e.y, _f = _d.canvasOverlayPosition, x1 = _f.x, y1 = _f.y;
            if (_this.t) {
                cancelRaf(_this.t);
            }
            var nearBoundary = [];
            var size = 10;
            if (x < 10) {
                nearBoundary = [size, 0];
            }
            else if (x + 10 > width) {
                nearBoundary = [-size, 0];
            }
            else if (y < 10) {
                nearBoundary = [0, size];
            }
            else if (y + 10 > height) {
                nearBoundary = [0, -size];
            }
            _this.setState({
                endX: x1,
                endY: y1,
                draging: true,
            });
            _this.moveAnchorEnd(x1, y1);
            if (nearBoundary.length > 0 && !stopMoveGraph && autoExpand) {
                _this.t = createRaf(function () {
                    var _a = __read(nearBoundary, 2), translateX = _a[0], translateY = _a[1];
                    transformModel.translate(translateX, translateY);
                    var _b = _this.state, endX = _b.endX, endY = _b.endY;
                    _this.setState({
                        endX: endX - translateX,
                        endY: endY - translateY,
                    });
                    _this.moveAnchorEnd(endX - translateX, endY - translateY);
                });
            }
            eventCenter.emit(EventType.ANCHOR_DRAG, {
                data: anchorData,
                e: event,
                nodeModel: nodeModel,
            });
        };
        _this.onDragEnd = function (event) {
            if (_this.t) {
                cancelRaf(_this.t);
            }
            _this.checkEnd(event);
            _this.setState({
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
                draging: false,
            });
            // 清除掉缓存结果 fix:#320 因为创建边之后，会影响校验结果变化，所以需要重新校验
            _this.sourceRuleResults.clear();
            _this.targetRuleResults.clear();
            var _a = _this.props, graphModel = _a.graphModel, nodeModel = _a.nodeModel, anchorData = _a.anchorData;
            graphModel.eventCenter.emit(EventType.ANCHOR_DRAGEND, {
                data: anchorData,
                e: event,
                nodeModel: nodeModel,
            });
        };
        _this.checkEnd = function (event) {
            var _a = _this.props, graphModel = _a.graphModel, nodeModel = _a.nodeModel, _b = _a.anchorData, x = _b.x, y = _b.y, id = _b.id;
            // nodeModel.setSelected(false);
            /* 创建边 */
            var edgeType = graphModel.edgeType;
            var _c = _this.state, endX = _c.endX, endY = _c.endY, draging = _c.draging;
            var info = targetNodeInfo({ x: endX, y: endY }, graphModel);
            // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
            if (_this.preTargetNode && _this.preTargetNode.state !== ElementState.DEFAULT) {
                _this.preTargetNode.setElementState(ElementState.DEFAULT);
            }
            // 没有draging就结束边
            if (!draging)
                return;
            if (info && info.node) {
                var targetNode = info.node;
                var anchorId = info.anchor.id;
                var targetInfoId = nodeModel.id + "_" + targetNode.id + "_" + anchorId + "_" + id;
                var _d = _this.sourceRuleResults.get(targetInfoId) || {}, isSourcePass = _d.isAllPass, sourceMsg = _d.msg;
                var _e = _this.targetRuleResults.get(targetInfoId) || {}, isTargetPass = _e.isAllPass, targetMsg = _e.msg;
                if (isSourcePass && isTargetPass) {
                    targetNode.setElementState(ElementState.DEFAULT);
                    var edgeData = graphModel.edgeGenerator(nodeModel.getData(), graphModel.getNodeModelById(info.node.id).getData());
                    var edgeModel = graphModel.addEdge(__assign(__assign({}, edgeData), { sourceNodeId: nodeModel.id, sourceAnchorId: id, startPoint: { x: x, y: y }, targetNodeId: info.node.id, targetAnchorId: info.anchor.id, endPoint: { x: info.anchor.x, y: info.anchor.y } }));
                    var anchorData = _this.props.anchorData;
                    graphModel.eventCenter.emit(EventType.ANCHOR_DROP, {
                        data: anchorData,
                        e: event,
                        nodeModel: nodeModel,
                        edgeModel: edgeModel,
                    });
                }
                else {
                    var nodeData = targetNode.getData();
                    graphModel.eventCenter.emit(EventType.CONNECTION_NOT_ALLOWED, {
                        data: nodeData,
                        msg: targetMsg || sourceMsg,
                    });
                }
            }
        };
        _this.sourceRuleResults = new Map();
        _this.targetRuleResults = new Map();
        _this.state = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            draging: false,
        };
        _this.dragHandler = new StepDrag({
            onDragStart: _this.onDragStart,
            onDraging: _this.onDraging,
            onDragEnd: _this.onDragEnd,
        });
        return _this;
    }
    Anchor.prototype.getAnchorShape = function () {
        var _a = this.props, anchorData = _a.anchorData, style = _a.style, node = _a.node;
        var anchorShape = node.getAnchorShape(anchorData);
        if (anchorShape)
            return anchorShape;
        var x = anchorData.x, y = anchorData.y;
        var hoverStyle = __assign(__assign({}, style), style.hover);
        return (h("g", null,
            h(Circle, __assign({ className: "lf-node-anchor-hover" }, hoverStyle, { x: x, y: y })),
            h(Circle, __assign({ className: "lf-node-anchor" }, style, { x: x, y: y }))));
    };
    Anchor.prototype.moveAnchorEnd = function (endX, endY) {
        var _a = this.props, graphModel = _a.graphModel, nodeModel = _a.nodeModel, anchorData = _a.anchorData;
        var info = targetNodeInfo({ x: endX, y: endY }, graphModel);
        if (info) {
            var targetNode = info.node;
            var anchorId = info.anchor.id;
            if (this.preTargetNode && this.preTargetNode !== info.node) {
                this.preTargetNode.setElementState(ElementState.DEFAULT);
            }
            // #500 不允许锚点自己连自己, 在锚点一开始连接的时候, 不触发自己连接自己的校验。
            if (anchorData.id === anchorId) {
                return;
            }
            this.preTargetNode = targetNode;
            // 支持节点的每个锚点单独设置是否可连接，因此规则key去nodeId + anchorId作为唯一值
            var targetInfoId = nodeModel.id + "_" + targetNode.id + "_" + anchorId + "_" + anchorData.id;
            // 查看鼠标是否进入过target，若有检验结果，表示进入过, 就不重复计算了。
            if (!this.targetRuleResults.has(targetInfoId)) {
                var targetAnchor = info.anchor;
                var sourceRuleResult = nodeModel.isAllowConnectedAsSource(targetNode, anchorData, targetAnchor);
                var targetRuleResult = targetNode.isAllowConnectedAsTarget(nodeModel, anchorData, targetAnchor);
                this.sourceRuleResults.set(targetInfoId, formateAnchorConnectValidateData(sourceRuleResult));
                this.targetRuleResults.set(targetInfoId, formateAnchorConnectValidateData(targetRuleResult));
            }
            var isSourcePass = this.sourceRuleResults.get(targetInfoId).isAllPass;
            var isTargetPass = this.targetRuleResults.get(targetInfoId).isAllPass;
            // 实时提示出即将链接的锚点
            if (isSourcePass && isTargetPass) {
                targetNode.setElementState(ElementState.ALLOW_CONNECT);
            }
            else {
                targetNode.setElementState(ElementState.NOT_ALLOW_CONNECT);
            }
        }
        else if (this.preTargetNode && this.preTargetNode.state !== ElementState.DEFAULT) {
            // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
            this.preTargetNode.setElementState(ElementState.DEFAULT);
        }
    };
    Anchor.prototype.isShowLine = function () {
        var _a = this.state, startX = _a.startX, startY = _a.startY, endX = _a.endX, endY = _a.endY;
        var v = distance(startX, startY, endX, endY);
        return v > 10;
    };
    Anchor.prototype.render = function () {
        var _this = this;
        var _a = this.state, startX = _a.startX, startY = _a.startY, endX = _a.endX, endY = _a.endY;
        var _b = this.props, edgeAddable = _b.anchorData.edgeAddable, edgeStyle = _b.edgeStyle;
        return (
        // className="lf-anchor" 作为下载时，需要将锚点删除的依据，不要修改类名
        h("g", { className: "lf-anchor" },
            h("g", { onMouseDown: function (ev) {
                    if (edgeAddable !== false) {
                        _this.dragHandler.handleMouseDown(ev);
                    }
                } }, this.getAnchorShape()),
            this.isShowLine() && (h(Line, __assign({ x1: startX, y1: startY, x2: endX, y2: endY }, edgeStyle, { "pointer-events": "none" })))));
    };
    return Anchor;
}(Component));
export default Anchor;
