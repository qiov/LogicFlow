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
import BaseEdge from './BaseEdge';
import { getEndTangent } from '../../util/edge';
import Path from '../basic-shape/Path';
var BezierEdge = /** @class */ (function (_super) {
    __extends(BezierEdge, _super);
    function BezierEdge() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BezierEdge.prototype.getEdge = function () {
        var model = this.props.model;
        var style = model.getEdgeStyle();
        var path = model.path, isAnimation = model.isAnimation, arrowConfig = model.arrowConfig;
        var animationStyle = model.getEdgeAnimationStyle();
        var strokeDasharray = animationStyle.strokeDasharray, stroke = animationStyle.stroke, strokeDashoffset = animationStyle.strokeDashoffset, animationName = animationStyle.animationName, animationDuration = animationStyle.animationDuration, animationIterationCount = animationStyle.animationIterationCount, animationTimingFunction = animationStyle.animationTimingFunction, animationDirection = animationStyle.animationDirection;
        return (h(Path, __assign({ d: path }, style, arrowConfig, isAnimation ? {
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
    BezierEdge.prototype.getShape = function () {
        return (h("g", null, this.getEdge()));
    };
    BezierEdge.prototype.getAnimation = function () {
        var model = this.props.model;
        var _a = model.getAnimation(), stroke = _a.stroke, className = _a.className, strokeDasharray = _a.strokeDasharray;
        var style = model.getEdgeStyle();
        return (h("g", null,
            h(Path, __assign({ d: model.path }, style, { className: className, strokeDasharray: strokeDasharray, stroke: stroke }))));
    };
    // 扩大bezier曲线可点击范围
    BezierEdge.prototype.getAppendWidth = function () {
        var path = this.props.model.path;
        return (h(Path, { d: path, strokeWidth: 10, stroke: "transparent", fill: "none" }));
    };
    BezierEdge.prototype.getArrowInfo = function () {
        var model = this.props.model;
        var hover = this.state.hover;
        var _a = model, path = _a.path, isSelected = _a.isSelected;
        var _b = __read(getEndTangent(path), 2), ePre = _b[0], end = _b[1];
        var arrowInfo = {
            start: ePre,
            end: end,
            hover: hover,
            isSelected: isSelected,
        };
        return arrowInfo;
    };
    return BezierEdge;
}(BaseEdge));
export default BezierEdge;
