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
import { computed, observable } from 'mobx';
import { cloneDeep } from 'lodash-es';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
var DiamondNodeModel = /** @class */ (function (_super) {
    __extends(DiamondNodeModel, _super);
    function DiamondNodeModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modelType = ModelType.DIAMOND_NODE;
        _this.rx = 30;
        _this.ry = 50;
        return _this;
    }
    DiamondNodeModel.prototype.getNodeStyle = function () {
        var style = _super.prototype.getNodeStyle.call(this);
        var diamond = this.graphModel.theme.diamond;
        return __assign(__assign({}, style), cloneDeep(diamond));
    };
    Object.defineProperty(DiamondNodeModel.prototype, "points", {
        get: function () {
            var _a = this, x = _a.x, y = _a.y, rx = _a.rx, ry = _a.ry;
            return [
                [x, y - ry],
                [x + rx, y],
                [x, y + ry],
                [x - rx, y],
            ];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiamondNodeModel.prototype, "pointsPosition", {
        get: function () {
            var pointsPosition = this.points.map(function (item) { return ({
                x: item[0],
                y: item[1],
            }); });
            return pointsPosition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiamondNodeModel.prototype, "width", {
        get: function () {
            var min = Number.MAX_SAFE_INTEGER;
            var max = Number.MIN_SAFE_INTEGER;
            this.points.forEach(function (_a) {
                var _b = __read(_a, 1), x = _b[0];
                if (x < min) {
                    min = x;
                }
                if (x > max) {
                    max = x;
                }
            });
            return max - min;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiamondNodeModel.prototype, "height", {
        get: function () {
            var min = Number.MAX_SAFE_INTEGER;
            var max = Number.MIN_SAFE_INTEGER;
            this.points.forEach(function (_a) {
                var _b = __read(_a, 2), y = _b[1];
                if (y < min) {
                    min = y;
                }
                if (y > max) {
                    max = y;
                }
            });
            return max - min;
        },
        enumerable: true,
        configurable: true
    });
    DiamondNodeModel.prototype.getDefaultAnchor = function () {
        var _this = this;
        return this.points.map(function (_a, idx) {
            var _b = __read(_a, 2), x1 = _b[0], y1 = _b[1];
            return ({ x: x1, y: y1, id: _this.id + "_" + idx });
        });
    };
    __decorate([
        observable
    ], DiamondNodeModel.prototype, "rx", void 0);
    __decorate([
        observable
    ], DiamondNodeModel.prototype, "ry", void 0);
    __decorate([
        computed
    ], DiamondNodeModel.prototype, "points", null);
    __decorate([
        computed
    ], DiamondNodeModel.prototype, "pointsPosition", null);
    __decorate([
        computed
    ], DiamondNodeModel.prototype, "width", null);
    __decorate([
        computed
    ], DiamondNodeModel.prototype, "height", null);
    return DiamondNodeModel;
}(BaseNodeModel));
export { DiamondNodeModel };
export default DiamondNodeModel;
