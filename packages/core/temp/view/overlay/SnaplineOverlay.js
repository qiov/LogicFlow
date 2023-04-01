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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { h, Component } from 'preact';
import Line from '../basic-shape/Line';
import { observer } from '../..';
var SnaplineOverlay = /** @class */ (function (_super) {
    __extends(SnaplineOverlay, _super);
    function SnaplineOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SnaplineOverlay.prototype.render = function () {
        var snaplineModel = this.props.snaplineModel;
        var position = snaplineModel.position, isShowHorizontal = snaplineModel.isShowHorizontal, isShowVertical = snaplineModel.isShowVertical;
        var style = snaplineModel.getStyle();
        var _a = position.x, x = _a === void 0 ? 0 : _a, _b = position.y, y = _b === void 0 ? 0 : _b;
        // 展示横向，纵向默认-100000,100000 减少计算量
        var horizontalLine = __assign(__assign({ x1: -100000, y1: y, x2: 100000, y2: y }, style), { stroke: isShowHorizontal ? style.stroke : 'none' });
        var vertailLine = __assign(__assign({ x1: x, y1: -100000, x2: x, y2: 100000 }, style), { stroke: isShowVertical ? style.stroke : 'none' });
        return (h("g", { className: "lf-snapline" },
            h(Line, __assign({}, horizontalLine)),
            h(Line, __assign({}, vertailLine))));
    };
    SnaplineOverlay = __decorate([
        observer
    ], SnaplineOverlay);
    return SnaplineOverlay;
}(Component));
export default SnaplineOverlay;
