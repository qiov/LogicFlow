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
import { h, Component } from 'preact';
import { StepDrag } from '../../util/drag';
import Text from '../basic-shape/Text';
import { ElementState } from '../../constant/constant';
var BaseText = /** @class */ (function (_super) {
    __extends(BaseText, _super);
    function BaseText(config) {
        var _this = _super.call(this) || this;
        _this.sumDeltaX = 0;
        _this.sumDeltaY = 0;
        _this.onDraging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var _b = _this.props, model = _b.model, transformModel = _b.graphModel.transformModel;
            var _c = __read(transformModel.fixDeltaXY(deltaX, deltaY), 2), curDeltaX = _c[0], curDeltaY = _c[1];
            model.moveText(curDeltaX, curDeltaY);
        };
        _this.dblClickHandler = function () {
            // 静默模式下，双击不更改状态，不可编辑
            var editable = _this.props.editable;
            if (editable) {
                var model = _this.props.model;
                model.setElementState(ElementState.TEXT_EDIT);
            }
        };
        _this.mouseDownHandle = function (ev) {
            var _a = _this.props, draggable = _a.draggable, nodeTextDraggable = _a.graphModel.editConfigModel.nodeTextDraggable;
            if (draggable || nodeTextDraggable) {
                _this.stepDrag.handleMouseDown(ev);
            }
        };
        var model = config.model, draggable = config.draggable;
        _this.stepDrag = new StepDrag({
            onDraging: _this.onDraging,
            step: 1,
            model: model,
            isStopPropagation: draggable,
        });
        return _this;
    }
    BaseText.prototype.getShape = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var text = model.text;
        var editConfigModel = graphModel.editConfigModel;
        var value = text.value, x = text.x, y = text.y, editable = text.editable, draggable = text.draggable;
        var attr = {
            x: x,
            y: y,
            className: '',
            value: value,
        };
        if (editable) {
            attr.className = 'lf-element-text';
        }
        else if (draggable || editConfigModel.nodeTextDraggable) {
            attr.className = 'lf-text-draggable';
        }
        else {
            attr.className = 'lf-text-disabled';
        }
        var style = model.getTextStyle();
        return (h(Text, __assign({}, attr, style, { model: model })));
    };
    BaseText.prototype.render = function () {
        var text = this.props.model.text;
        if (text) {
            return (h("g", { onMouseDown: this.mouseDownHandle, onDblClick: this.dblClickHandler }, this.getShape()));
        }
    };
    return BaseText;
}(Component));
export default BaseText;
