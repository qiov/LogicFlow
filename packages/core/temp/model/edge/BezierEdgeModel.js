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
import { action, observable } from 'mobx';
import { cloneDeep } from 'lodash-es';
import BaseEdgeModel from './BaseEdgeModel';
import { ModelType } from '../../constant/constant';
import { getBezierControlPoints } from '../../util/edge';
export { BezierEdgeModel };
var BezierEdgeModel = /** @class */ (function (_super) {
    __extends(BezierEdgeModel, _super);
    function BezierEdgeModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modelType = ModelType.BEZIER_EDGE;
        _this.path = '';
        return _this;
    }
    BezierEdgeModel.prototype.initEdgeData = function (data) {
        this.offset = 100;
        _super.prototype.initEdgeData.call(this, data);
    };
    BezierEdgeModel.prototype.getEdgeStyle = function () {
        var bezier = this.graphModel.theme.bezier;
        var style = _super.prototype.getEdgeStyle.call(this);
        return __assign(__assign({}, style), cloneDeep(bezier));
    };
    BezierEdgeModel.prototype.getTextPosition = function () {
        if (this.pointsList && this.pointsList.length > 0) {
            var pointsXSum_1 = 0;
            var pointsYSum_1 = 0;
            this.pointsList.forEach(function (_a) {
                var x = _a.x, y = _a.y;
                pointsXSum_1 += x;
                pointsYSum_1 += y;
            });
            return {
                x: pointsXSum_1 / this.pointsList.length,
                y: pointsYSum_1 / this.pointsList.length,
            };
        }
        return {
            x: (this.startPoint.x + this.endPoint.x) / 2,
            y: (this.startPoint.y + this.endPoint.y) / 2,
        };
    };
    BezierEdgeModel.prototype.getData = function () {
        var data = _super.prototype.getData.call(this);
        var pointsList = this.pointsList.map(function (_a) {
            var x = _a.x, y = _a.y;
            return ({ x: x, y: y });
        });
        return __assign(__assign({}, data), { pointsList: pointsList });
    };
    /* 获取贝塞尔曲线的控制点 */
    BezierEdgeModel.prototype.getControls = function () {
        var start = this.startPoint;
        var end = this.endPoint;
        var points = getBezierControlPoints({
            start: start,
            end: end,
            sourceNode: this.sourceNode,
            targetNode: this.targetNode,
            offset: this.offset,
        });
        return points;
    };
    /* 获取贝塞尔曲线的path */
    BezierEdgeModel.prototype.getPath = function (points) {
        var _a = __read(points, 4), start = _a[0], sNext = _a[1], ePre = _a[2], end = _a[3];
        return "M " + start.x + " " + start.y + "\n    C " + sNext.x + " " + sNext.y + ",\n    " + ePre.x + " " + ePre.y + ",\n    " + end.x + " " + end.y;
    };
    BezierEdgeModel.prototype.initPoints = function () {
        if (this.pointsList.length > 0) {
            this.path = this.getPath(this.pointsList);
        }
        else {
            this.updatePoints();
        }
    };
    BezierEdgeModel.prototype.updatePoints = function () {
        var _a = this.getControls(), sNext = _a.sNext, ePre = _a.ePre;
        this.updatePath(sNext, ePre);
    };
    BezierEdgeModel.prototype.updatePath = function (sNext, ePre) {
        var start = {
            x: this.startPoint.x,
            y: this.startPoint.y,
        };
        var end = {
            x: this.endPoint.x,
            y: this.endPoint.y,
        };
        if (!sNext || !ePre) {
            var control = this.getControls();
            sNext = control.sNext;
            ePre = control.ePre;
        }
        this.pointsList = [start, sNext, ePre, end];
        this.path = this.getPath(this.pointsList);
    };
    BezierEdgeModel.prototype.updateStartPoint = function (anchor) {
        this.startPoint = anchor;
        this.updatePoints();
    };
    BezierEdgeModel.prototype.updateEndPoint = function (anchor) {
        this.endPoint = anchor;
        this.updatePoints();
    };
    BezierEdgeModel.prototype.moveStartPoint = function (deltaX, deltaY) {
        this.startPoint.x += deltaX;
        this.startPoint.y += deltaY;
        var _a = __read(this.pointsList, 3), sNext = _a[1], ePre = _a[2];
        // 保持调整点一起移动
        sNext.x += deltaX;
        sNext.y += deltaY;
        this.updatePath(sNext, ePre);
    };
    BezierEdgeModel.prototype.moveEndPoint = function (deltaX, deltaY) {
        this.endPoint.x += deltaX;
        this.endPoint.y += deltaY;
        var _a = __read(this.pointsList, 3), sNext = _a[1], ePre = _a[2];
        // 保持调整点一起移动
        ePre.x += deltaX;
        ePre.y += deltaY;
        this.updatePath(sNext, ePre);
    };
    BezierEdgeModel.prototype.updateAdjustAnchor = function (anchor, type) {
        if (type === 'sNext') {
            this.pointsList[1] = anchor;
        }
        else if (type === 'ePre') {
            this.pointsList[2] = anchor;
        }
        this.path = this.getPath(this.pointsList);
        this.setText(Object.assign({}, this.text, this.textPosition));
    };
    // 获取边调整的起点
    BezierEdgeModel.prototype.getAdjustStart = function () {
        return this.pointsList[0] || this.startPoint;
    };
    // 获取边调整的终点
    BezierEdgeModel.prototype.getAdjustEnd = function () {
        var pointsList = this.pointsList;
        return pointsList[pointsList.length - 1] || this.endPoint;
    };
    // 起终点拖拽调整过程中，进行曲线路径更新
    BezierEdgeModel.prototype.updateAfterAdjustStartAndEnd = function (_a) {
        var startPoint = _a.startPoint, endPoint = _a.endPoint, sourceNode = _a.sourceNode, targetNode = _a.targetNode;
        var _b = getBezierControlPoints({
            start: startPoint,
            end: endPoint,
            sourceNode: sourceNode,
            targetNode: targetNode,
            offset: this.offset,
        }), sNext = _b.sNext, ePre = _b.ePre;
        this.pointsList = [startPoint, sNext, ePre, endPoint];
        this.initPoints();
    };
    __decorate([
        observable
    ], BezierEdgeModel.prototype, "path", void 0);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "initPoints", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "updatePoints", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "updateStartPoint", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "updateEndPoint", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "moveStartPoint", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "moveEndPoint", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "updateAdjustAnchor", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "getAdjustStart", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "getAdjustEnd", null);
    __decorate([
        action
    ], BezierEdgeModel.prototype, "updateAfterAdjustStartAndEnd", null);
    return BezierEdgeModel;
}(BaseEdgeModel));
export default BezierEdgeModel;
