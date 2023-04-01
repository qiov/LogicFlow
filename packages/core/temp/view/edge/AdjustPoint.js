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
import Circle from '../basic-shape/Circle';
import { createDrag } from '../../util/drag';
import { formateAnchorConnectValidateData, targetNodeInfo } from '../../util/node';
import { ElementState, EventType, ModelType } from '../../constant/constant';
var AdjustType;
(function (AdjustType) {
    AdjustType["SOURCE"] = "SOURCE";
    AdjustType["TARGET"] = "TARGET";
})(AdjustType || (AdjustType = {}));
var AdjustPoint = /** @class */ (function (_super) {
    __extends(AdjustPoint, _super);
    function AdjustPoint() {
        var _this = _super.call(this) || this;
        _this.onDragStart = function () {
            var _a = _this.props, x = _a.x, y = _a.y, edgeModel = _a.edgeModel;
            var startPoint = edgeModel.startPoint, endPoint = edgeModel.endPoint, pointsList = edgeModel.pointsList;
            // 记录下原始路径信息，在调整中，如果放弃调整，进行路径还原
            _this.oldEdge = {
                startPoint: startPoint,
                endPoint: endPoint,
                pointsList: pointsList,
            };
            _this.setState({
                endX: x,
                endY: y,
                draging: true,
            });
            edgeModel.isHitable = false;
        };
        _this.onDraging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var _b = _this.state, endX = _b.endX, endY = _b.endY;
            var _c = _this.props, graphModel = _c.graphModel, type = _c.type;
            var transformModel = graphModel.transformModel;
            var _d = __read(transformModel.moveCanvasPointByHtml([endX, endY], deltaX, deltaY), 2), x = _d[0], y = _d[1];
            _this.setState({
                endX: x,
                endY: y,
                draging: true,
            });
            // 调整过程中实时更新路径
            var edgeModel = _this.props.edgeModel;
            var info = targetNodeInfo({ x: endX, y: endY }, graphModel);
            // 如果一定的坐标能够找到目标节点，预结算当前节点与目标节点的路径进行展示
            if (info && info.node && _this.isAllowAdjust(info)) {
                var params = void 0;
                var startPoint = edgeModel.startPoint, endPoint = edgeModel.endPoint, sourceNode = edgeModel.sourceNode, targetNode = edgeModel.targetNode;
                if (type === AdjustType.SOURCE) {
                    params = {
                        startPoint: { x: info.anchor.x, y: info.anchor.y },
                        endPoint: { x: endPoint.x, y: endPoint.y },
                        sourceNode: info.node,
                        targetNode: targetNode,
                    };
                }
                else if (type === AdjustType.TARGET) {
                    params = {
                        startPoint: { x: startPoint.x, y: startPoint.y },
                        endPoint: { x: info.anchor.x, y: info.anchor.y },
                        sourceNode: sourceNode,
                        targetNode: info.node,
                    };
                }
                edgeModel.updateAfterAdjustStartAndEnd(params);
            }
            else if (type === AdjustType.SOURCE) {
                // 如果没有找到目标节点，更显起终点为当前坐标
                edgeModel.updateStartPoint({ x: x, y: y });
            }
            else if (type === AdjustType.TARGET) {
                edgeModel.updateEndPoint({ x: x, y: y });
            }
        };
        _this.onDragEnd = function () {
            var _a, _b;
            // 将状态置为非拖拽状态
            _this.setState({
                draging: false,
            });
            var _c = _this.props, graphModel = _c.graphModel, edgeModel = _c.edgeModel, type = _c.type;
            edgeModel.isHitable = true;
            var _d = _this.state, endX = _d.endX, endY = _d.endY, draging = _d.draging;
            var info = targetNodeInfo({ x: endX, y: endY }, graphModel);
            // 没有draging就结束边
            if (!draging)
                return;
            // 如果找到目标节点，删除老边，创建新边
            if (info && info.node && _this.isAllowAdjust(info)) {
                var edgeData = edgeModel.getData();
                var createEdgeInfo = __assign(__assign({}, edgeData), { sourceAnchorId: '', targetAnchorId: '', text: ((_a = edgeData === null || edgeData === void 0 ? void 0 : edgeData.text) === null || _a === void 0 ? void 0 : _a.value) || '' });
                // 根据调整点是边的起点或重点，计算创建边需要的参数
                if (type === AdjustType.SOURCE) {
                    var edgeInfo = graphModel.edgeGenerator(graphModel.getNodeModelById(info.node.id).getData(), graphModel.getNodeModelById(edgeModel.targetNodeId).getData(), createEdgeInfo);
                    createEdgeInfo = __assign(__assign({}, edgeInfo), { sourceNodeId: info.node.id, sourceAnchorId: info.anchor.id, startPoint: { x: info.anchor.x, y: info.anchor.y }, targetNodeId: edgeModel.targetNodeId, endPoint: __assign({}, edgeModel.endPoint) });
                }
                else if (type === AdjustType.TARGET) {
                    var edgeInfo = graphModel.edgeGenerator(graphModel.getNodeModelById(edgeModel.sourceNodeId).getData(), graphModel.getNodeModelById(info.node.id).getData(), createEdgeInfo);
                    createEdgeInfo = __assign(__assign({}, edgeInfo), { sourceNodeId: edgeModel.sourceNodeId, startPoint: __assign({}, edgeModel.startPoint), targetNodeId: info.node.id, targetAnchorId: info.anchor.id, endPoint: { x: info.anchor.x, y: info.anchor.y } });
                }
                // 为了保证id不变必须要先删除老边，再创建新边，创建新边是会判断是否有重复的id
                // 删除老边
                graphModel.deleteEdgeById(edgeModel.id);
                // 创建新边
                var edge = graphModel.addEdge(__assign({}, createEdgeInfo));
                // 向外抛出事件
                graphModel.eventCenter.emit(EventType.EDGE_EXCHANGE_NODE, { data: { newEdge: edge.getData(), oldEdge: edgeModel.getData() } });
            }
            else {
                // 如果没有找到目标节点，还原边
                _this.recoveryEdge();
            }
            (_b = _this.preTargetNode) === null || _b === void 0 ? void 0 : _b.setElementState(ElementState.DEFAULT);
        };
        // 还原边
        _this.recoveryEdge = function () {
            var edgeModel = _this.props.edgeModel;
            var _a = _this.oldEdge, startPoint = _a.startPoint, endPoint = _a.endPoint, pointsList = _a.pointsList;
            edgeModel.updateStartPoint(startPoint);
            edgeModel.updateEndPoint(endPoint);
            // 折线和曲线还需要更新其pointsList
            if (edgeModel.modelType !== ModelType.LINE_EDGE) {
                edgeModel.pointsList = pointsList;
                edgeModel.initPoints();
            }
        };
        // 调整点的样式默认从主题中读取， 可以复写此方法进行更加个性化的自定义
        // 目前仅支持圆形图标进行标识，可以从圆形的r和颜色上进行调整
        _this.getAdjustPointStyle = function () {
            var theme = _this.props.graphModel.theme;
            var edgeAdjust = theme.edgeAdjust;
            return edgeAdjust;
        };
        _this.state = {
            draging: false,
            endX: 0,
            endY: 0,
        };
        _this.targetRuleResults = new Map();
        _this.sourceRuleResults = new Map();
        // todo: 换成stepDrag，参考anchor对外抛出事件
        _this.dragHandler = createDrag({
            onDragStart: _this.onDragStart,
            onDraging: _this.onDraging,
            onDragEnd: _this.onDragEnd,
        });
        return _this;
    }
    AdjustPoint.prototype.isAllowAdjust = function (info) {
        var _a = this.props, _b = _a.edgeModel, id = _b.id, sourceNode = _b.sourceNode, targetNode = _b.targetNode, sourceAnchorId = _b.sourceAnchorId, targetAnchorId = _b.targetAnchorId, type = _a.type;
        // const newTargetNode = info.node;
        var newSourceNode = null;
        var newTargetNode = null;
        var newSourceAnchor = null;
        var newTargetAnchor = null;
        // 如果调整的是连线起点
        if (type === AdjustType.SOURCE) {
            newSourceNode = info.node;
            newTargetNode = targetNode;
            newSourceAnchor = info.anchor;
            newTargetAnchor = targetNode.getAnchorInfo(targetAnchorId);
        }
        else {
            newSourceNode = sourceNode;
            newTargetNode = info.node;
            newTargetAnchor = info.anchor;
            newSourceAnchor = sourceNode.getAnchorInfo(sourceAnchorId);
        }
        // 如果前一个接触的节点和此时接触的节点不相等，则将前一个节点状态重新设置为默认状态。
        if (this.preTargetNode && this.preTargetNode !== info.node) {
            this.preTargetNode.setElementState(ElementState.DEFAULT);
        }
        this.preTargetNode = info.node;
        // #500 不允许锚点自己连自己, 在锚点一开始连接的时候, 不触发自己连接自己的校验。
        if (newTargetAnchor.id === newSourceAnchor.id) {
            return false;
        }
        var targetInfoId = newSourceNode.id + "_" + newTargetNode.id + "_" + newSourceAnchor.id + "_" + newTargetAnchor.id;
        // 查看鼠标是否进入过target，若有检验结果，表示进入过, 就不重复计算了。
        if (!this.targetRuleResults.has(targetInfoId)) {
            var sourceRuleResult = newSourceNode.isAllowConnectedAsSource(newTargetNode, newSourceAnchor, newTargetAnchor);
            var targetRuleResult = newTargetNode.isAllowConnectedAsTarget(newSourceNode, newSourceAnchor, newTargetAnchor);
            this.sourceRuleResults.set(targetInfoId, formateAnchorConnectValidateData(sourceRuleResult));
            this.targetRuleResults.set(targetInfoId, formateAnchorConnectValidateData(targetRuleResult));
        }
        var isSourcePass = this.sourceRuleResults.get(targetInfoId).isAllPass;
        var isTargetPass = this.targetRuleResults.get(targetInfoId).isAllPass;
        // 实时提示出即将连接的节点是否允许连接
        var state = (isSourcePass && isTargetPass)
            ? ElementState.ALLOW_CONNECT
            : ElementState.NOT_ALLOW_CONNECT;
        if (type === AdjustType.SOURCE) {
            newSourceNode.setElementState(state);
        }
        else {
            newTargetNode.setElementState(state);
        }
        return isSourcePass && isTargetPass;
    };
    AdjustPoint.prototype.render = function () {
        var _a = this.props, x = _a.x, y = _a.y;
        var draging = this.state.draging;
        var style = this.getAdjustPointStyle();
        return (h("g", null,
            h(Circle, __assign({ className: "lf-edge-adjust-point" }, style, { x: x, y: y }, { onMouseDown: this.dragHandler, "pointer-events": draging ? 'none' : '' }))));
    };
    return AdjustPoint;
}(Component));
export default AdjustPoint;
