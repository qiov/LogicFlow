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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { h, Component, } from 'preact';
import { observer } from '..';
import { ElementType, EventType } from '../constant/constant';
import { getNodeOutline, getEdgeOutline } from '../algorithm/outline';
import { StepDrag } from '../util/drag';
var MultipleSelect = /** @class */ (function (_super) {
    __extends(MultipleSelect, _super);
    function MultipleSelect(props) {
        var _this = _super.call(this) || this;
        _this.handleMouseDown = function (ev) {
            _this.stepDrag.handleMouseDown(ev);
        };
        _this.onDraging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            var graphModel = _this.props.graphModel;
            var selectElements = graphModel.getSelectElements(true);
            graphModel.moveNodes(selectElements.nodes.map(function (node) { return node.id; }), deltaX, deltaY);
        };
        _this.handleContextMenu = function (ev) {
            ev.preventDefault();
            var _a = _this.props, graphModel = _a.graphModel, _b = _a.graphModel, eventCenter = _b.eventCenter, selectElements = _b.selectElements;
            var position = graphModel.getPointByClient({
                x: ev.clientX,
                y: ev.clientY,
            });
            var selectGraphData = {
                nodes: [],
                edges: [],
            };
            var models = __spread(selectElements.values());
            models.forEach(function (model) {
                if (model.BaseType === ElementType.NODE) {
                    selectGraphData.nodes.push(model.getData());
                }
                if (model.BaseType === ElementType.EDGE) {
                    selectGraphData.edges.push(model.getData());
                }
            });
            eventCenter.emit(EventType.SELECTION_CONTEXTMENU, {
                data: selectGraphData,
                e: ev,
                position: position,
            });
        };
        var _a = props.graphModel, gridSize = _a.gridSize, eventCenter = _a.eventCenter;
        _this.stepDrag = new StepDrag({
            onDraging: _this.onDraging,
            step: gridSize,
            eventType: 'SELECTION',
            eventCenter: eventCenter,
        });
        return _this;
    }
    MultipleSelect.prototype.render = function () {
        var _a, _b;
        var _c = this.props.graphModel, selectElements = _c.selectElements, transformModel = _c.transformModel;
        if (selectElements.size <= 1)
            return;
        var x = Number.MAX_SAFE_INTEGER;
        var y = Number.MAX_SAFE_INTEGER;
        var x1 = Number.MIN_SAFE_INTEGER;
        var y1 = Number.MIN_SAFE_INTEGER;
        selectElements.forEach(function (element) {
            var outline = {
                x: 0,
                y: 0,
                x1: 0,
                y1: 0,
            };
            if (element.BaseType === ElementType.NODE)
                outline = getNodeOutline(element);
            if (element.BaseType === ElementType.EDGE)
                outline = getEdgeOutline(element);
            x = Math.min(x, outline.x);
            y = Math.min(y, outline.y);
            x1 = Math.max(x1, outline.x1);
            y1 = Math.max(y1, outline.y1);
        });
        _a = __read(transformModel.CanvasPointToHtmlPoint([x, y]), 2), x = _a[0], y = _a[1];
        _b = __read(transformModel.CanvasPointToHtmlPoint([x1, y1]), 2), x1 = _b[0], y1 = _b[1];
        var style = {
            left: x - 10 + "px",
            top: y - 10 + "px",
            width: x1 - x + 20 + "px",
            height: y1 - y + 20 + "px",
        };
        return (h("div", { className: "lf-multiple-select", style: style, onMouseDown: this.handleMouseDown, onContextMenu: this.handleContextMenu }));
    };
    MultipleSelect.toolName = 'multipleSelect';
    MultipleSelect = __decorate([
        observer
    ], MultipleSelect);
    return MultipleSelect;
}(Component));
export default MultipleSelect;
