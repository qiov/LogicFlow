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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { h, Component } from 'preact';
import { createUuid } from '../../util/uuid';
import { observer } from '../..';
var Grid = /** @class */ (function (_super) {
    __extends(Grid, _super);
    function Grid() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = createUuid();
        return _this;
    }
    // 网格类型为点状
    Grid.prototype.renderDot = function () {
        var _a = this.props, _b = _a.config, color = _b.color, _c = _b.thickness, thickness = _c === void 0 ? 2 : _c, size = _a.size, visible = _a.visible;
        var length = Math.min(Math.max(2, thickness), size / 2); // 2 < length < size /2
        var opacity = 1;
        if (!visible) {
            opacity = 0;
        }
        /* eslint-disable-next-line */
        return h("rect", { width: length, height: length, rx: length / 2, ry: length / 2, fill: color, opacity: opacity });
    };
    // 网格类型为交叉线
    // todo: 采用背景缩放的方式，实现更好的体验
    Grid.prototype.renderMesh = function () {
        var _a = this.props, _b = _a.config, color = _b.color, _c = _b.thickness, thickness = _c === void 0 ? 1 : _c, size = _a.size, visible = _a.visible;
        var strokeWidth = Math.min(Math.max(1, thickness), size / 2); // 1 < strokeWidth < size /2
        var d = "M " + size + " 0 H0 M0 0 V0 " + size;
        var opacity = 1;
        if (!visible) {
            opacity = 0;
        }
        return h("path", { d: d, stroke: color, strokeWidth: strokeWidth, opacity: opacity });
    };
    Grid.prototype.render = function () {
        // TODO 生成网格️️️✔、网格支持 options（size）✔
        var _a = this.props, type = _a.type, size = _a.size, transformModel = _a.graphModel.transformModel;
        var SCALE_X = transformModel.SCALE_X, SKEW_Y = transformModel.SKEW_Y, SKEW_X = transformModel.SKEW_X, SCALE_Y = transformModel.SCALE_Y, TRANSLATE_X = transformModel.TRANSLATE_X, TRANSLATE_Y = transformModel.TRANSLATE_Y;
        var matrixString = [SCALE_X, SKEW_Y, SKEW_X, SCALE_Y, TRANSLATE_X, TRANSLATE_Y].join(',');
        var transform = "matrix(" + matrixString + ")";
        // const transitionStyle = {
        //   transition: 'all 0.1s ease',
        // };
        return (h("div", { className: "lf-grid" },
            h("svg", { xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: "100%", height: "100%" },
                h("defs", null,
                    h("pattern", { id: this.id, patternUnits: "userSpaceOnUse", patternTransform: transform, x: "0", y: "0", width: size, height: size },
                        type === 'dot' && this.renderDot(),
                        type === 'mesh' && this.renderMesh())),
                h("rect", { width: "100%", height: "100%", fill: "url(#" + this.id + ")" }))));
    };
    Grid = __decorate([
        observer
    ], Grid);
    return Grid;
}(Component));
export default Grid;
Grid.defaultProps = {
    size: 20,
    visible: true,
    type: 'dot',
    config: {
        color: '#ababab',
        thickness: 1,
    },
};
