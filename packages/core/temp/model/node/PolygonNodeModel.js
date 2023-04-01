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
var PolygonNodeModel = /** @class */ (function (_super) {
    __extends(PolygonNodeModel, _super);
    function PolygonNodeModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modelType = ModelType.POLYGON_NODE;
        _this.points = [
            [50, 0],
            [100, 50],
            [50, 100],
            [0, 50],
        ];
        return _this;
    }
    PolygonNodeModel.prototype.getNodeStyle = function () {
        var style = _super.prototype.getNodeStyle.call(this);
        var polygon = this.graphModel.theme.polygon;
        return __assign(__assign({}, style), cloneDeep(polygon));
    };
    Object.defineProperty(PolygonNodeModel.prototype, "pointsPosition", {
        /**
         * 由于大多数情况下，我们初始化拿到的多边形坐标都是基于原点的（例如绘图工具到处的svg）。
         * 在logicflow中对多边形进行移动，我们不需要去更新points，
         * 而是去更新多边形中心点即可。
         */
        get: function () {
            var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
            var pointsPosition = this.points.map(function (item) { return ({
                x: item[0] + x - width / 2,
                y: item[1] + y - height / 2,
            }); });
            return pointsPosition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PolygonNodeModel.prototype, "width", {
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
    Object.defineProperty(PolygonNodeModel.prototype, "height", {
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
    PolygonNodeModel.prototype.getDefaultAnchor = function () {
        var _this = this;
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height, points = _a.points;
        return points.map(function (_a, idx) {
            var _b = __read(_a, 2), x1 = _b[0], y1 = _b[1];
            return ({
                x: x + x1 - width / 2,
                y: y + y1 - height / 2,
                id: _this.id + "_" + idx,
            });
        });
    };
    __decorate([
        observable
    ], PolygonNodeModel.prototype, "points", void 0);
    __decorate([
        computed
    ], PolygonNodeModel.prototype, "pointsPosition", null);
    __decorate([
        computed
    ], PolygonNodeModel.prototype, "width", null);
    __decorate([
        computed
    ], PolygonNodeModel.prototype, "height", null);
    return PolygonNodeModel;
}(BaseNodeModel));
export { PolygonNodeModel };
export default PolygonNodeModel;
