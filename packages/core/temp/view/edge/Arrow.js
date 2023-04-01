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
import Path from '../basic-shape/Path';
import { getVerticalPointOfLine } from '../../algorithm/index';
var Arrow = /** @class */ (function (_super) {
    __extends(Arrow, _super);
    function Arrow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Arrow.prototype.getArrowAttributes = function () {
        var _a = this.props, arrowInfo = _a.arrowInfo, style = _a.style;
        var start = arrowInfo.start, end = arrowInfo.end;
        var config = {
            start: start,
            end: end,
            offset: style.offset,
            verticalLength: style.verticalLength,
            type: 'end',
        };
        var _b = getVerticalPointOfLine(config), leftX = _b.leftX, leftY = _b.leftY, rightX = _b.rightX, rightY = _b.rightY;
        return __assign({ d: "M" + leftX + " " + leftY + " L" + end.x + " " + end.y + " L" + rightX + " " + rightY + " z" }, style);
    };
    Arrow.prototype.getShape = function () {
        var _a = this.getArrowAttributes(), d = _a.d, strokeWidth = _a.strokeWidth, stroke = _a.stroke, fill = _a.fill;
        return (h(Path, { d: d, fill: fill, strokeWidth: strokeWidth, stroke: stroke }));
    };
    Arrow.prototype.render = function () {
        return (h("g", { className: "lf-arrow" }, this.getShape()));
    };
    return Arrow;
}(Component));
export default Arrow;
