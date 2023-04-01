import { noop } from 'lodash-es';
import { EventType } from '../constant/constant';
// import { snapToGrid } from './geometry';
var DOC = window.document;
var LEFT_MOUSE_BUTTON_CODE = 0;
function createDrag(_a) {
    var _b = _a.onDragStart, onDragStart = _b === void 0 ? noop : _b, _c = _a.onDraging, onDraging = _c === void 0 ? noop : _c, _d = _a.onDragEnd, onDragEnd = _d === void 0 ? noop : _d, _e = _a.step, step = _e === void 0 ? 1 : _e, _f = _a.isStopPropagation, isStopPropagation = _f === void 0 ? true : _f;
    var isDraging = false;
    var isStartDraging = false;
    var startX = 0;
    var startY = 0;
    var sumDeltaX = 0;
    var sumDeltaY = 0;
    function handleMouseMove(e) {
        if (isStopPropagation)
            e.stopPropagation();
        if (!isStartDraging)
            return;
        isDraging = true;
        sumDeltaX += e.clientX - startX;
        sumDeltaY += e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        if (Math.abs(sumDeltaX) > step || Math.abs(sumDeltaY) > step) {
            var remainderX = sumDeltaX % step;
            var remainderY = sumDeltaY % step;
            var deltaX = sumDeltaX - remainderX;
            var deltaY = sumDeltaY - remainderY;
            sumDeltaX = remainderX;
            sumDeltaY = remainderY;
            onDraging({ deltaX: deltaX, deltaY: deltaY, event: e });
        }
    }
    function handleMouseUp(e) {
        if (isStopPropagation)
            e.stopPropagation();
        isStartDraging = false;
        DOC.removeEventListener('mousemove', handleMouseMove, false);
        DOC.removeEventListener('mouseup', handleMouseUp, false);
        if (!isDraging)
            return;
        isDraging = false;
        return onDragEnd({ event: e });
    }
    function handleMouseDown(e) {
        if (e.button !== LEFT_MOUSE_BUTTON_CODE)
            return;
        if (isStopPropagation)
            e.stopPropagation();
        isStartDraging = true;
        startX = e.clientX;
        startY = e.clientY;
        DOC.addEventListener('mousemove', handleMouseMove, false);
        DOC.addEventListener('mouseup', handleMouseUp, false);
        return onDragStart({ event: e });
    }
    return handleMouseDown;
}
// 支持拖拽的时候，按照指定step进行。
// 因为在绘制的过程中因为放大缩小，移动的真实的step则是变化的。
var StepDrag = /** @class */ (function () {
    function StepDrag(_a) {
        var _this = this;
        var _b = _a.onDragStart, onDragStart = _b === void 0 ? noop : _b, _c = _a.onDraging, onDraging = _c === void 0 ? noop : _c, _d = _a.onDragEnd, onDragEnd = _d === void 0 ? noop : _d, _e = _a.eventType, eventType = _e === void 0 ? '' : _e, _f = _a.eventCenter, eventCenter = _f === void 0 ? null : _f, _g = _a.step, step = _g === void 0 ? 1 : _g, _h = _a.isStopPropagation, isStopPropagation = _h === void 0 ? true : _h, _j = _a.model, model = _j === void 0 ? null : _j;
        this.isDraging = false;
        this.isStartDraging = false;
        this.startX = 0;
        this.startY = 0;
        this.sumDeltaX = 0;
        this.sumDeltaY = 0;
        this.handleMouseDown = function (e) {
            var _a, _b;
            if (e.button !== LEFT_MOUSE_BUTTON_CODE)
                return;
            if (_this.isStopPropagation)
                e.stopPropagation();
            _this.isStartDraging = true;
            _this.startX = e.clientX;
            _this.startY = e.clientY;
            DOC.addEventListener('mousemove', _this.handleMouseMove, false);
            DOC.addEventListener('mouseup', _this.handleMouseUp, false);
            var elementData = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
            (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(EventType[_this.eventType + "_MOUSEDOWN"], { e: e, data: elementData });
            _this.startTime = new Date().getTime();
        };
        this.handleMouseMove = function (e) {
            var _a, _b;
            if (_this.isStopPropagation)
                e.stopPropagation();
            if (!_this.isStartDraging)
                return;
            _this.sumDeltaX += e.clientX - _this.startX;
            _this.sumDeltaY += e.clientY - _this.startY;
            _this.startX = e.clientX;
            _this.startY = e.clientY;
            if (_this.step <= 1
                || Math.abs(_this.sumDeltaX) > _this.step
                || Math.abs(_this.sumDeltaY) > _this.step) {
                var remainderX = _this.sumDeltaX % _this.step;
                var remainderY = _this.sumDeltaY % _this.step;
                var deltaX_1 = _this.sumDeltaX - remainderX;
                var deltaY_1 = _this.sumDeltaY - remainderY;
                _this.sumDeltaX = remainderX;
                _this.sumDeltaY = remainderY;
                var elementData_1 = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
                /**
                 * 为了区分点击和拖动，在鼠标没有拖动时，不触发dragstart。
                 */
                if (!_this.isDraging) {
                    (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(EventType[_this.eventType + "_DRAGSTART"], { e: e, data: elementData_1 });
                    _this.onDragStart({ event: e });
                }
                _this.isDraging = true;
                // 为了让dragstart和drag不在同一个事件循环中，使drag事件放到下一个消息队列中。
                Promise.resolve().then(function () {
                    var _a, _b;
                    _this.onDraging({ deltaX: deltaX_1, deltaY: deltaY_1, event: e });
                    (_a = _this.eventCenter) === null || _a === void 0 ? void 0 : _a.emit(EventType[_this.eventType + "_MOUSEMOVE"], { e: e, data: elementData_1 });
                    (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(EventType[_this.eventType + "_DRAG"], { e: e, data: elementData_1 });
                });
            }
        };
        this.handleMouseUp = function (e) {
            _this.isStartDraging = false;
            if (_this.isStopPropagation)
                e.stopPropagation();
            // fix #568: 如果onDraging在下一个事件循环中触发，而drop在当前事件循环，会出现问题。
            Promise.resolve().then(function () {
                var _a, _b, _c;
                DOC.removeEventListener('mousemove', _this.handleMouseMove, false);
                DOC.removeEventListener('mouseup', _this.handleMouseUp, false);
                var elementData = (_a = _this.model) === null || _a === void 0 ? void 0 : _a.getData();
                (_b = _this.eventCenter) === null || _b === void 0 ? void 0 : _b.emit(EventType[_this.eventType + "_MOUSEUP"], { e: e, data: elementData });
                if (!_this.isDraging)
                    return;
                _this.isDraging = false;
                _this.onDragEnd({ event: e });
                (_c = _this.eventCenter) === null || _c === void 0 ? void 0 : _c.emit(EventType[_this.eventType + "_DROP"], { e: e, data: elementData });
            });
        };
        this.cancelDrag = function () {
            DOC.removeEventListener('mousemove', _this.handleMouseMove, false);
            DOC.removeEventListener('mouseup', _this.handleMouseUp, false);
            _this.onDragEnd({ event: null });
            _this.isDraging = false;
        };
        this.onDragStart = onDragStart;
        this.onDraging = onDraging;
        this.onDragEnd = onDragEnd;
        this.step = step;
        this.isStopPropagation = isStopPropagation;
        this.eventType = eventType;
        this.eventCenter = eventCenter;
        this.model = model;
    }
    StepDrag.prototype.setStep = function (step) {
        this.step = step;
    };
    return StepDrag;
}());
export { createDrag, StepDrag, };
