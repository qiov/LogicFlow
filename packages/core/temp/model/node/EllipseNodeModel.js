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
import { computed, observable } from 'mobx';
import { cloneDeep } from 'lodash-es';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
var EllipseNodeModel = /** @class */ (function (_super) {
    __extends(EllipseNodeModel, _super);
    function EllipseNodeModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modelType = ModelType.ELLIPSE_NODE;
        _this.rx = 30;
        _this.ry = 45;
        return _this;
    }
    EllipseNodeModel.prototype.getNodeStyle = function () {
        var style = _super.prototype.getNodeStyle.call(this);
        var ellipse = this.graphModel.theme.ellipse;
        return __assign(__assign({}, style), cloneDeep(ellipse));
    };
    Object.defineProperty(EllipseNodeModel.prototype, "width", {
        get: function () {
            return this.rx * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EllipseNodeModel.prototype, "height", {
        get: function () {
            return this.ry * 2;
        },
        enumerable: true,
        configurable: true
    });
    EllipseNodeModel.prototype.getDefaultAnchor = function () {
        var _a = this, x = _a.x, y = _a.y, rx = _a.rx, ry = _a.ry;
        return [
            { x: x, y: y - ry, id: this.id + "_0" },
            { x: x + rx, y: y, id: this.id + "_1" },
            { x: x, y: y + ry, id: this.id + "_2" },
            { x: x - rx, y: y, id: this.id + "_3" },
        ];
    };
    __decorate([
        observable
    ], EllipseNodeModel.prototype, "rx", void 0);
    __decorate([
        observable
    ], EllipseNodeModel.prototype, "ry", void 0);
    __decorate([
        computed
    ], EllipseNodeModel.prototype, "width", null);
    __decorate([
        computed
    ], EllipseNodeModel.prototype, "height", null);
    return EllipseNodeModel;
}(BaseNodeModel));
export { EllipseNodeModel };
export default EllipseNodeModel;
