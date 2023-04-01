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
import { h } from 'preact';
import Line from '../basic-shape/Line';
import Path from '../basic-shape/Path';
import BaseEdge from './BaseEdge';
import { getAppendAttributes } from '../../util/edge';
var LineEdge = /** @class */ (function (_super) {
    __extends(LineEdge, _super);
    function LineEdge() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LineEdge.prototype.getEdge = function () {
        var model = this.props.model;
        var startPoint = model.startPoint, endPoint = model.endPoint, isAnimation = model.isAnimation, arrowConfig = model.arrowConfig;
        var style = model.getEdgeStyle();
        var animationStyle = model.getEdgeAnimationStyle();
        var strokeDasharray = animationStyle.strokeDasharray, stroke = animationStyle.stroke, strokeDashoffset = animationStyle.strokeDashoffset, animationName = animationStyle.animationName, animationDuration = animationStyle.animationDuration, animationIterationCount = animationStyle.animationIterationCount, animationTimingFunction = animationStyle.animationTimingFunction, animationDirection = animationStyle.animationDirection;
        return (h(Line, __assign({}, style, { x1: startPoint.x, y1: startPoint.y, x2: endPoint.x, y2: endPoint.y }, arrowConfig, isAnimation ? {
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
    LineEdge.prototype.getShape = function () {
        return (h("g", null, this.getEdge()));
    };
    LineEdge.prototype.getAnimation = function () {
        var model = this.props.model;
        var _a = model.getAnimation(), stroke = _a.stroke, className = _a.className, strokeDasharray = _a.strokeDasharray;
        var startPoint = model.startPoint, endPoint = model.endPoint;
        var style = model.getEdgeStyle();
        return (h("g", null,
            h(Line, __assign({}, style, { x1: startPoint.x, y1: startPoint.y, x2: endPoint.x, y2: endPoint.y, className: className, strokeDasharray: strokeDasharray, stroke: stroke }))));
    };
    LineEdge.prototype.getAppendWidth = function () {
        var model = this.props.model;
        var startPoint = model.startPoint, endPoint = model.endPoint;
        var appendInfo = {
            start: startPoint,
            end: endPoint,
        };
        var _a = getAppendAttributes(appendInfo), d = _a.d, strokeWidth = _a.strokeWidth, fill = _a.fill, strokeDasharray = _a.strokeDasharray, stroke = _a.stroke;
        return (h(Path, { d: d, fill: fill, strokeWidth: strokeWidth, stroke: stroke, strokeDasharray: strokeDasharray }));
    };
    return LineEdge;
}(BaseEdge));
export default LineEdge;
