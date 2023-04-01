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
import { h } from 'preact';
import Polyline from '../basic-shape/Polyline';
import BaseEdge from './BaseEdge';
import { EventType, SegmentDirection } from '../../constant/constant';
import { points2PointsList } from '../../util/edge';
import { getVerticalPointOfLine } from '../../algorithm';
import Path from '../basic-shape/Path';
import { createDrag } from '../../util/drag';
var PolylineEdge = /** @class */ (function (_super) {
    __extends(PolylineEdge, _super);
    function PolylineEdge() {
        var _this = _super.call(this) || this;
        _this.onDragStart = function () {
            var polylineModel = _this.props.model;
            polylineModel.dragAppendStart();
        };
        _this.onDraging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var _b = _this.props, model = _b.model, graphModel = _b.graphModel;
            _this.isDraging = true;
            var transformModel = graphModel.transformModel, editConfigModel = graphModel.editConfigModel;
            var _c = __read(transformModel.fixDeltaXY(deltaX, deltaY), 2), curDeltaX = _c[0], curDeltaY = _c[1];
            var polylineModel = model;
            // 更新当前拖拽的线段信息
            // 1、如果只允许调整中间线段调用dragAppendSimple
            // 2、如果允许调整所有线段调用dragAppend
            var adjustEdgeMiddle = editConfigModel.adjustEdgeMiddle;
            if (adjustEdgeMiddle) {
                _this.appendInfo = polylineModel.dragAppendSimple(_this.appendInfo, { x: curDeltaX, y: curDeltaY });
            }
            else {
                _this.appendInfo = polylineModel.dragAppend(_this.appendInfo, { x: curDeltaX, y: curDeltaY });
            }
        };
        _this.onDragEnd = function () {
            var _a = _this.props, model = _a.model, eventCenter = _a.graphModel.eventCenter;
            var polylineModel = model;
            polylineModel.dragAppendEnd();
            _this.isDraging = false;
            // 情况当前拖拽的线段信息
            _this.appendInfo = undefined;
            // 向外抛出事件
            eventCenter.emit(EventType.EDGE_ADJUST, { data: polylineModel.getData() });
        };
        _this.beforeDragStart = function (e, appendInfo) {
            // 如果允许拖拽调整触发事件处理
            if (appendInfo.dragAble) {
                _this.dragHandler(e);
            }
            // 记录当前拖拽的线段信息
            _this.appendInfo = appendInfo;
        };
        // 是否正在拖拽，在折线调整时，不展示起终点的调整点
        _this.getIsDraging = function () { return _this.isDraging; };
        _this.drag = createDrag({
            onDragStart: _this.onDragStart,
            onDraging: _this.onDraging,
            onDragEnd: _this.onDragEnd,
            isStopPropagation: false,
        });
        return _this;
    }
    PolylineEdge.prototype.getEdge = function () {
        var model = this.props.model;
        var points = model.points, isAnimation = model.isAnimation, arrowConfig = model.arrowConfig;
        var style = model.getEdgeStyle();
        var animationStyle = model.getEdgeAnimationStyle();
        var strokeDasharray = animationStyle.strokeDasharray, stroke = animationStyle.stroke, strokeDashoffset = animationStyle.strokeDashoffset, animationName = animationStyle.animationName, animationDuration = animationStyle.animationDuration, animationIterationCount = animationStyle.animationIterationCount, animationTimingFunction = animationStyle.animationTimingFunction, animationDirection = animationStyle.animationDirection;
        return (h(Polyline, __assign({ points: points }, style, arrowConfig, isAnimation ? {
            strokeDasharray: strokeDasharray,
            stroke: stroke,
            style: {
                strokeDashoffset: strokeDashoffset,
                animationName: animationName,
                animationDuration: animationDuration,
                animationIterationCount: animationIterationCount,
                animationTimingFunction: animationTimingFunction,
                animationDirection: animationDirection,
            },
        } : {})));
    };
    PolylineEdge.prototype.getShape = function () {
        return (h("g", null, this.getEdge()));
    };
    PolylineEdge.prototype.getAnimation = function () {
        var model = this.props.model;
        var _a = model.getAnimation(), stroke = _a.stroke, className = _a.className, strokeDasharray = _a.strokeDasharray;
        var style = model.getEdgeStyle();
        return (h("g", null,
            h(Polyline, __assign({ points: model.points }, style, { className: className, strokeDasharray: strokeDasharray, stroke: stroke }))));
    };
    PolylineEdge.prototype.getArrowInfo = function () {
        var model = this.props.model;
        var points = model.points, isSelected = model.isSelected;
        var hover = this.state.hover;
        var arrowInfo = {
            start: null,
            end: null,
            hover: hover,
            isSelected: isSelected,
        };
        var currentPositionList = points2PointsList(points);
        // 两点重合时不计算起终点
        if (currentPositionList.length >= 2) {
            arrowInfo.start = currentPositionList[currentPositionList.length - 2];
            arrowInfo.end = currentPositionList[currentPositionList.length - 1];
        }
        return arrowInfo;
    };
    PolylineEdge.prototype.getAppendAttributes = function (appendInfo) {
        var start = appendInfo.start, end = appendInfo.end;
        var d;
        if (start.x === end.x && start.y === end.y) {
            // 拖拽过程中会出现起终点重合的情况，这时候append无法计算
            d = '';
        }
        else {
            var config = {
                start: start,
                end: end,
                offset: 10,
                verticalLength: 5,
            };
            var startPosition = getVerticalPointOfLine(__assign(__assign({}, config), { type: 'start' }));
            var endPosition = getVerticalPointOfLine(__assign(__assign({}, config), { type: 'end' }));
            d = "M" + startPosition.leftX + " " + startPosition.leftY + " \n      L" + startPosition.rightX + " " + startPosition.rightY + " \n      L" + endPosition.rightX + " " + endPosition.rightY + "\n      L" + endPosition.leftX + " " + endPosition.leftY + " z";
        }
        return {
            d: d,
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 1,
            strokeDasharray: '4, 4',
        };
    };
    PolylineEdge.prototype.getAppendShape = function (appendInfo) {
        var _a = this.getAppendAttributes(appendInfo), d = _a.d, strokeWidth = _a.strokeWidth, fill = _a.fill, strokeDasharray = _a.strokeDasharray, stroke = _a.stroke;
        return (h(Path, { d: d, fill: fill, strokeWidth: strokeWidth, stroke: stroke, strokeDasharray: strokeDasharray }));
    };
    PolylineEdge.prototype.getAppendWidth = function () {
        var _this = this;
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var pointsList = model.pointsList, draggable = model.draggable;
        var LineAppendList = [];
        var pointsLen = pointsList.length;
        var _loop_1 = function (i) {
            var className = 'lf-polyline-append';
            var appendInfo = {
                start: {
                    x: pointsList[i].x,
                    y: pointsList[i].y,
                },
                end: {
                    x: pointsList[i + 1].x,
                    y: pointsList[i + 1].y,
                },
                startIndex: i,
                endIndex: i + 1,
                direction: '',
                dragAble: true,
            };
            var append = (h("g", { className: className }, this_1.getAppendShape(appendInfo)));
            var editConfigModel = graphModel.editConfigModel;
            var adjustEdge = editConfigModel.adjustEdge, adjustEdgeMiddle = editConfigModel.adjustEdgeMiddle;
            if (!adjustEdge || !draggable) {
                this_1.dragHandler = function () { };
            }
            else {
                this_1.dragHandler = this_1.drag;
                var startIndex = appendInfo.startIndex, endIndex = appendInfo.endIndex;
                // 如果不允许调整起点和终点相连的线段，设置该线段appendInfo的dragAble为false
                var dragDisable = adjustEdgeMiddle && (startIndex === 0 || endIndex === pointsLen - 1);
                appendInfo.dragAble = !dragDisable;
                if (appendInfo.start.x === appendInfo.end.x) {
                    // 水平
                    if (appendInfo.dragAble) {
                        className += '-ew-resize';
                    }
                    appendInfo.direction = SegmentDirection.VERTICAL;
                }
                else if (appendInfo.start.y === appendInfo.end.y) {
                    // 垂直
                    if (appendInfo.dragAble) {
                        className += '-ns-resize';
                    }
                    appendInfo.direction = SegmentDirection.HORIZONTAL;
                }
                append = (h("g", { className: this_1.isDraging ? 'lf-dragging' : 'lf-drag-able', onMouseDown: function (e) { return _this.beforeDragStart(e, appendInfo); } },
                    h("g", { className: className }, this_1.getAppendShape(appendInfo))));
            }
            LineAppendList.push(append);
        };
        var this_1 = this;
        for (var i = 0; i < pointsLen - 1; i++) {
            _loop_1(i);
        }
        return h("g", null, LineAppendList);
    };
    return PolylineEdge;
}(BaseEdge));
export default PolylineEdge;
