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
import { h, Component } from 'preact';
import LineText from '../text/LineText';
import { ElementState, EventType, ModelType, OverlapMode } from '../../constant/constant';
import { getClosestPointOfPolyline } from '../../util/edge';
import AdjustPoint from './AdjustPoint';
import { isMultipleSelect } from '../../util/graph';
var BaseEdge = /** @class */ (function (_super) {
    __extends(BaseEdge, _super);
    function BaseEdge() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleHover = function (hovered, ev) {
            var _a = _this.props, model = _a.model, eventCenter = _a.graphModel.eventCenter;
            model.setHovered(hovered);
            var eventName = hovered ? EventType.EDGE_MOUSEENTER : EventType.EDGE_MOUSELEAVE;
            var nodeData = model.getData();
            eventCenter.emit(eventName, {
                data: nodeData,
                e: ev,
            });
        };
        _this.setHoverON = function (ev) {
            // ! hover多次触发, onMouseOver + onMouseEnter
            var isHovered = _this.props.model.isHovered;
            if (isHovered)
                return;
            _this.handleHover(true, ev);
        };
        _this.setHoverOFF = function (ev) {
            _this.handleHover(false, ev);
        };
        // 右键点击节点，设置节点未现在菜单状态
        _this.handleContextMenu = function (ev) {
            ev.preventDefault();
            // 节点右击也会触发时间，区分右击和点击(mouseup)
            _this.contextMenuTime = new Date().getTime();
            if (_this.clickTimer) {
                clearTimeout(_this.clickTimer);
            }
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            var position = graphModel.getPointByClient({
                x: ev.clientX,
                y: ev.clientY,
            });
            graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, position.domOverlayPosition);
            _this.toFront();
            graphModel.selectEdgeById(model.id);
            // 边数据
            var edgeData = model === null || model === void 0 ? void 0 : model.getData();
            graphModel.eventCenter.emit(EventType.EDGE_CONTEXTMENU, {
                data: edgeData,
                e: ev,
                position: position,
            });
        };
        _this.handleMouseDown = function (e) {
            e.stopPropagation();
            _this.startTime = new Date().getTime();
        };
        // todo: 去掉setTimeout
        _this.handleMouseUp = function (e) {
            if (!_this.startTime)
                return;
            var time = new Date().getTime() - _this.startTime;
            if (time > 200)
                return; // 事件大于200ms，认为是拖拽。
            var isRightClick = e.button === 2;
            if (isRightClick)
                return;
            // 这里 IE 11不能正确显示
            var isDoubleClick = e.detail === 2;
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            var edgeData = model === null || model === void 0 ? void 0 : model.getData();
            var position = graphModel.getPointByClient({
                x: e.clientX,
                y: e.clientY,
            });
            if (isDoubleClick) {
                var editConfigModel_1 = graphModel.editConfigModel, textEditElement = graphModel.textEditElement;
                // 当前边正在编辑，需要先重置状态才能变更文本框位置
                if (textEditElement && textEditElement.id === model.id) {
                    graphModel.setElementStateById(model.id, ElementState.DEFAULT);
                }
                // 边文案可编辑状态，才可以进行文案编辑
                if (editConfigModel_1.edgeTextEdit && model.text.editable) {
                    graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
                }
                if (model.modelType === ModelType.POLYLINE_EDGE) {
                    var polylineEdgeModel = model;
                    var _b = graphModel.getPointByClient({ x: e.x, y: e.y }).canvasOverlayPosition, x = _b.x, y = _b.y;
                    var crossPoint = getClosestPointOfPolyline({ x: x, y: y }, polylineEdgeModel.points);
                    polylineEdgeModel.dbClickPosition = crossPoint;
                }
                graphModel.eventCenter.emit(EventType.EDGE_DBCLICK, {
                    data: edgeData,
                    e: e,
                    position: position,
                });
            }
            else { // 单击
                // 边右击也会触发mouseup事件，判断是否有右击，如果有右击则取消点击事件触发
                // 边数据
                graphModel.eventCenter.emit(EventType.ELEMENT_CLICK, {
                    data: edgeData,
                    e: e,
                    position: position,
                });
                graphModel.eventCenter.emit(EventType.EDGE_CLICK, {
                    data: edgeData,
                    e: e,
                    position: position,
                });
            }
            var editConfigModel = graphModel.editConfigModel;
            graphModel.selectEdgeById(model.id, isMultipleSelect(e, editConfigModel));
            _this.toFront();
        };
        // 是否正在拖拽，在折线调整时，不展示起终点的调整点
        _this.getIsDraging = function () { return false; };
        return _this;
    }
    BaseEdge.prototype.getShape = function () { };
    BaseEdge.prototype.getTextStyle = function () {
    };
    BaseEdge.prototype.getText = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        // 文本被编辑的时候，显示编辑框，不显示文本。
        if (model.state === ElementState.TEXT_EDIT) {
            return '';
        }
        var draggable = false;
        var editConfigModel = graphModel.editConfigModel;
        if (model.text.draggable || editConfigModel.edgeTextDraggable) {
            draggable = true;
        }
        return (h(LineText, { editable: editConfigModel.edgeTextEdit && model.text.editable, model: model, graphModel: graphModel, draggable: draggable }));
    };
    BaseEdge.prototype.getArrowInfo = function () {
        var model = this.props.model;
        var startPoint = model.startPoint, endPoint = model.endPoint, isSelected = model.isSelected;
        var hover = this.state.hover;
        return {
            start: startPoint,
            end: endPoint,
            hover: hover,
            isSelected: isSelected,
        };
    };
    BaseEdge.prototype.getArrowStyle = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var edgeStyle = model.getEdgeStyle();
        var edgeAnimationStyle = model.getEdgeAnimationStyle();
        var arrow = graphModel.theme.arrow;
        var stroke = model.isAnimation ? edgeAnimationStyle.stroke : edgeStyle.stroke;
        return __assign(__assign(__assign({}, edgeStyle), { fill: stroke, stroke: stroke }), arrow);
    };
    BaseEdge.prototype.getArrow = function () {
        var id = this.props.model.id;
        var _a = this.getArrowStyle(), _b = _a.refY, refY = _b === void 0 ? 0 : _b, _c = _a.refX, refX = _c === void 0 ? 2 : _c;
        return (h("g", null,
            h("defs", null,
                h("marker", { id: "marker-start-" + id, refX: refX, refY: refY, overflow: "visible", orient: "auto", markerUnits: "userSpaceOnUse" }, this.getStartArrow()),
                h("marker", { id: "marker-end-" + id, refX: refX, refY: refY, overflow: "visible", orient: "auto", markerUnits: "userSpaceOnUse" }, this.getEndArrow()))));
    };
    BaseEdge.prototype.getStartArrow = function () {
        var _a = this.getArrowStyle(), stroke = _a.stroke, strokeWidth = _a.strokeWidth, offset = _a.offset, verticalLength = _a.verticalLength;
        return h("path", { stroke: stroke, fill: stroke, strokeWidth: strokeWidth, d: "M 0 0 L " + offset + " -" + verticalLength + " L " + offset + " " + verticalLength + " Z" });
    };
    BaseEdge.prototype.getEndArrow = function () {
        var _a = this.getArrowStyle(), stroke = _a.stroke, strokeWidth = _a.strokeWidth, offset = _a.offset, verticalLength = _a.verticalLength;
        return h("path", { stroke: stroke, fill: stroke, strokeWidth: strokeWidth, transform: "rotate(180)", d: "M 0 0 L " + offset + " -" + verticalLength + " L " + offset + " " + verticalLength + " Z" });
    };
    // 起点终点，可以修改起点/终点为其他节点
    BaseEdge.prototype.getAdjustPoints = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var start = model.getAdjustStart();
        var end = model.getAdjustEnd();
        return (h("g", null,
            h(AdjustPoint, __assign({ type: "SOURCE" }, start, { edgeModel: model, graphModel: graphModel })),
            h(AdjustPoint, __assign({ type: "TARGET" }, end, { edgeModel: model, graphModel: graphModel }))));
    };
    BaseEdge.prototype.getAnimation = function () { };
    BaseEdge.prototype.getAppendWidth = function () {
        return h("g", null);
    };
    BaseEdge.prototype.getAppend = function () {
        return (h("g", { className: "lf-edge-append" }, this.getAppendWidth()));
    };
    BaseEdge.prototype.toFront = function () {
        var _a = this.props, graphModel = _a.graphModel, model = _a.model;
        var overlapMode = graphModel.overlapMode;
        if (overlapMode !== OverlapMode.INCREASE) {
            graphModel.toFront(model.id);
        }
    };
    BaseEdge.prototype.render = function () {
        var _a = this.props, _b = _a.model, isSelected = _b.isSelected, isHitable = _b.isHitable, graphModel = _a.graphModel;
        var isDraging = this.getIsDraging();
        var adjustEdgeStartAndEnd = graphModel.editConfigModel.adjustEdgeStartAndEnd, animation = graphModel.animation;
        // performance 只允许出现一条edge有动画
        var isShowAnimation = isSelected && animation.edge
            && graphModel.getSelectElements().edges.length === 1;
        return (h("g", null,
            h("g", { className: [
                    'lf-edge',
                    !isHitable && 'pointer-none',
                    isSelected && 'lf-edge-selected',
                ].filter(Boolean).join(' '), onMouseDown: this.handleMouseDown, onMouseUp: this.handleMouseUp, onContextMenu: this.handleContextMenu, onMouseOver: this.setHoverON, onMouseEnter: this.setHoverON, onMouseLeave: this.setHoverOFF },
                this.getShape(),
                this.getAppend(),
                isShowAnimation && this.getAnimation(),
                this.getText(),
                this.getArrow()),
            (adjustEdgeStartAndEnd && isSelected && !isDraging) ? this.getAdjustPoints() : ''));
    };
    return BaseEdge;
}(Component));
export default BaseEdge;
