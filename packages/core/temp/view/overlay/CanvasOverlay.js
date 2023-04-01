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
import { EventType } from '../../constant/constant';
import { StepDrag } from '../../util/drag';
import { observer } from '../..';
// type InjectedProps = IProps & {
//   transformStyle: GraphTransform
// };
var CanvasOverlay = /** @class */ (function (_super) {
    __extends(CanvasOverlay, _super);
    function CanvasOverlay(props) {
        var _this = _super.call(this) || this;
        _this.stepScrollX = 0;
        _this.stepScrollY = 0;
        // get InjectedProps() {
        //   return this.props as InjectedProps;
        // }
        _this.onDraging = function (_a) {
            var deltaX = _a.deltaX, deltaY = _a.deltaY;
            _this.setState({
                isDraging: true,
            });
            var _b = _this.props.graphModel, transformModel = _b.transformModel, editConfigModel = _b.editConfigModel;
            if (editConfigModel.stopMoveGraph) {
                return;
            }
            transformModel.translate(deltaX, deltaY);
        };
        _this.onDragEnd = function () {
            _this.setState({
                isDraging: false,
            });
        };
        _this.zoomHandler = function (ev) {
            var _a = _this.props, _b = _a.graphModel, editConfigModel = _b.editConfigModel, transformModel = _b.transformModel, gridSize = _b.gridSize, graphModel = _a.graphModel;
            var eX = ev.deltaX, eY = ev.deltaY;
            // 如果没有禁止滚动移动画布, 并且当前触发的时候ctrl键没有按住, 那么移动画布
            if (!editConfigModel.stopScrollGraph && ev.ctrlKey !== true) {
                ev.preventDefault();
                _this.stepScrollX += eX;
                _this.stepScrollY += eY;
                if (Math.abs(_this.stepScrollX) >= gridSize) {
                    var remainderX = _this.stepScrollX % gridSize;
                    var moveDistence = _this.stepScrollX - remainderX;
                    transformModel.translate(-moveDistence * transformModel.SCALE_X, 0);
                    _this.stepScrollX = remainderX;
                }
                if (Math.abs(_this.stepScrollY) >= gridSize) {
                    var remainderY = _this.stepScrollY % gridSize;
                    var moveDistenceY = _this.stepScrollY - remainderY;
                    transformModel.translate(0, -moveDistenceY * transformModel.SCALE_Y);
                    _this.stepScrollY = remainderY;
                }
                return;
            }
            // 如果没有禁止缩放画布，那么进行缩放. 在禁止缩放画布后，按住ctrl键也不能缩放了。
            if (!editConfigModel.stopZoomGraph) {
                ev.preventDefault();
                var position = graphModel.getPointByClient({
                    x: ev.clientX,
                    y: ev.clientY,
                });
                var _c = position.canvasOverlayPosition, x = _c.x, y = _c.y;
                transformModel.zoom(ev.deltaY < 0, [x, y]);
            }
        };
        _this.clickHandler = function (ev) {
            // 点击空白处取消节点选中状态, 不包括冒泡过来的事件。
            var target = ev.target;
            if (target.getAttribute('name') === 'canvas-overlay') {
                var graphModel = _this.props.graphModel;
                var selectElements = graphModel.selectElements;
                if (selectElements.size > 0) {
                    graphModel.clearSelectElements();
                }
                graphModel.eventCenter.emit(EventType.BLANK_CLICK, { e: ev });
            }
        };
        _this.handleContextMenu = function (ev) {
            var target = ev.target;
            if (target.getAttribute('name') === 'canvas-overlay') {
                ev.preventDefault();
                var graphModel = _this.props.graphModel;
                var position = graphModel.getPointByClient({
                    x: ev.clientX,
                    y: ev.clientY,
                });
                // graphModel.setElementState(ElementState.SHOW_MENU, position.domOverlayPosition);
                graphModel.eventCenter.emit(EventType.BLANK_CONTEXTMENU, { e: ev, position: position });
            }
        };
        _this.mouseDownHandler = function (ev) {
            var _a = _this.props.graphModel, eventCenter = _a.eventCenter, editConfigModel = _a.editConfigModel, SCALE_X = _a.transformModel.SCALE_X, gridSize = _a.gridSize;
            var target = ev.target;
            var isFrozenElement = !editConfigModel.adjustEdge && !editConfigModel.adjustNodePosition;
            if (target.getAttribute('name') === 'canvas-overlay' || isFrozenElement) {
                if (!editConfigModel.stopMoveGraph) {
                    _this.stepDrag.setStep(gridSize * SCALE_X);
                    _this.stepDrag.handleMouseDown(ev);
                }
                else {
                    eventCenter.emit(EventType.BLANK_MOUSEDOWN, { e: ev });
                }
                // 为了处理画布移动的时候，编辑和菜单仍然存在的问题。
                _this.clickHandler(ev);
            }
        };
        var _a = props.graphModel, gridSize = _a.gridSize, eventCenter = _a.eventCenter;
        _this.stepDrag = new StepDrag({
            onDraging: _this.onDraging,
            onDragEnd: _this.onDragEnd,
            step: gridSize,
            eventType: 'BLANK',
            isStopPropagation: false,
            eventCenter: eventCenter,
            model: null,
        });
        // 当ctrl键被按住的时候，可以放大缩小。
        _this.state = {
            isDraging: false,
        };
        return _this;
    }
    CanvasOverlay.prototype.render = function () {
        var transformModel = this.props.graphModel.transformModel;
        var transform = transformModel.getTransformStyle().transform;
        var _a = this.props, children = _a.children, dnd = _a.dnd;
        var isDraging = this.state.isDraging;
        return (h("svg", __assign({ xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", name: "canvas-overlay", onWheel: this.zoomHandler, onMouseDown: this.mouseDownHandler, onContextMenu: this.handleContextMenu, className: isDraging ? 'lf-canvas-overlay lf-dragging' : 'lf-canvas-overlay lf-drag-able' }, dnd.eventMap()),
            h("g", { transform: transform }, children)));
    };
    CanvasOverlay = __decorate([
        observer
    ], CanvasOverlay);
    return CanvasOverlay;
}(Component));
export default CanvasOverlay;
