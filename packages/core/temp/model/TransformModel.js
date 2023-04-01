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
import { observable, action } from 'mobx';
import { EventType } from '../constant/constant';
var TransfromModel = /** @class */ (function () {
    function TransfromModel(eventCenter) {
        this.MINI_SCALE_SIZE = 0.2;
        this.MAX_SCALE_SIZE = 16;
        this.SCALE_X = 1;
        this.SKEW_Y = 0;
        this.SKEW_X = 0;
        this.SCALE_Y = 1;
        this.TRANSLATE_X = 0;
        this.TRANSLATE_Y = 0;
        this.ZOOM_SIZE = 0.04;
        this.eventCenter = eventCenter;
    }
    TransfromModel.prototype.setZoomMiniSize = function (size) {
        this.MINI_SCALE_SIZE = size;
    };
    TransfromModel.prototype.setZoomMaxSize = function (size) {
        this.MAX_SCALE_SIZE = size;
    };
    /**
     * 将最外层graph上的点基于缩放转换为canvasOverlay层上的点。
     * @param param0 HTML点
     */
    TransfromModel.prototype.HtmlPointToCanvasPoint = function (_a) {
        var _b = __read(_a, 2), x = _b[0], y = _b[1];
        return [(x - this.TRANSLATE_X) / this.SCALE_X, (y - this.TRANSLATE_Y) / this.SCALE_Y];
    };
    /**
     * 将最外层canvasOverlay层上的点基于缩放转换为graph上的点。
     * @param param0 HTML点
     */
    TransfromModel.prototype.CanvasPointToHtmlPoint = function (_a) {
        var _b = __read(_a, 2), x = _b[0], y = _b[1];
        return [x * this.SCALE_X + this.TRANSLATE_X, y * this.SCALE_Y + this.TRANSLATE_Y];
    };
    /**
     * 将一个在canvas上的点，向x轴方向移动directionX距离，向y轴方向移动dirctionY距离。
     * 因为canvas可能被缩小或者放大了，所以其在canvas层移动的距离需要计算上缩放的量。
     * @param point 点
     * @param directionX x轴距离
     * @param directionY y轴距离
     */
    TransfromModel.prototype.moveCanvasPointByHtml = function (_a, directionX, directionY) {
        var _b = __read(_a, 2), x = _b[0], y = _b[1];
        return [x + directionX / this.SCALE_X, y + directionY / this.SCALE_Y];
    };
    /**
     * 根据缩放情况，获取缩放后的delta距离
     * @param deltaX x轴距离变化
     * @param deltaY y轴距离变化
     */
    TransfromModel.prototype.fixDeltaXY = function (deltaX, deltaY) {
        return [deltaX / this.SCALE_X, deltaY / this.SCALE_Y];
    };
    /**
     * 基于当前的缩放，获取画布渲染样式transform值
     */
    TransfromModel.prototype.getTransformStyle = function () {
        var matrixString = [this.SCALE_X, this.SKEW_Y, this.SKEW_X, this.SCALE_Y, this.TRANSLATE_X, this.TRANSLATE_Y].join(',');
        return {
            transform: "matrix(" + matrixString + ")",
        };
    };
    /**
     * 放大缩小图形
     * @param zoomSize 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小
     * @param point 缩放的原点
     * @returns {string} -放大缩小的比例
     */
    TransfromModel.prototype.zoom = function (zoomSize, point) {
        if (zoomSize === void 0) { zoomSize = false; }
        var newScaleX = this.SCALE_X;
        var newScaleY = this.SCALE_Y;
        if (zoomSize === true) {
            newScaleX += this.ZOOM_SIZE;
            newScaleY += this.ZOOM_SIZE;
        }
        else if (zoomSize === false) {
            newScaleX -= this.ZOOM_SIZE;
            newScaleY -= this.ZOOM_SIZE;
        }
        else if (typeof zoomSize === 'number') {
            newScaleX = zoomSize;
            newScaleY = zoomSize;
        }
        if (newScaleX < this.MINI_SCALE_SIZE || newScaleX > this.MAX_SCALE_SIZE) {
            return this.SCALE_X * 100 + "%";
        }
        if (point) {
            this.TRANSLATE_X -= (newScaleX - this.SCALE_X) * point[0];
            this.TRANSLATE_Y -= (newScaleY - this.SCALE_Y) * point[1];
        }
        this.SCALE_X = newScaleX;
        this.SCALE_Y = newScaleY;
        this.emitGraphTransform('zoom');
        return this.SCALE_X * 100 + "%";
    };
    TransfromModel.prototype.emitGraphTransform = function (type) {
        this.eventCenter.emit(EventType.GRAPH_TRANSFORM, {
            type: type,
            transform: {
                SCALE_X: this.SCALE_X,
                SKEW_Y: this.SKEW_Y,
                SKEW_X: this.SKEW_X,
                SCALE_Y: this.SCALE_Y,
                TRANSLATE_X: this.TRANSLATE_X,
                TRANSLATE_Y: this.TRANSLATE_Y,
            },
        });
    };
    TransfromModel.prototype.resetZoom = function () {
        this.SCALE_X = 1;
        this.SCALE_Y = 1;
        this.emitGraphTransform('resetZoom');
    };
    TransfromModel.prototype.translate = function (x, y) {
        this.TRANSLATE_X += x;
        this.TRANSLATE_Y += y;
        this.emitGraphTransform('translate');
    };
    /**
     * 将图形定位到画布中心
     * @param targetX 图形当前x坐标
     * @param targetY 图形当前y坐标
     * @param width 画布宽
     * @param height 画布高
     */
    TransfromModel.prototype.focusOn = function (targetX, targetY, width, height) {
        var _a = __read(this.CanvasPointToHtmlPoint([targetX, targetY]), 2), x = _a[0], y = _a[1];
        var _b = __read([width / 2 - x, height / 2 - y], 2), deltaX = _b[0], deltaY = _b[1];
        this.TRANSLATE_X += deltaX;
        this.TRANSLATE_Y += deltaY;
        this.emitGraphTransform('focusOn');
    };
    __decorate([
        observable
    ], TransfromModel.prototype, "SCALE_X", void 0);
    __decorate([
        observable
    ], TransfromModel.prototype, "SKEW_Y", void 0);
    __decorate([
        observable
    ], TransfromModel.prototype, "SKEW_X", void 0);
    __decorate([
        observable
    ], TransfromModel.prototype, "SCALE_Y", void 0);
    __decorate([
        observable
    ], TransfromModel.prototype, "TRANSLATE_X", void 0);
    __decorate([
        observable
    ], TransfromModel.prototype, "TRANSLATE_Y", void 0);
    __decorate([
        observable
    ], TransfromModel.prototype, "ZOOM_SIZE", void 0);
    __decorate([
        action
    ], TransfromModel.prototype, "zoom", null);
    __decorate([
        action
    ], TransfromModel.prototype, "resetZoom", null);
    __decorate([
        action
    ], TransfromModel.prototype, "translate", null);
    __decorate([
        action
    ], TransfromModel.prototype, "focusOn", null);
    return TransfromModel;
}());
export default TransfromModel;
