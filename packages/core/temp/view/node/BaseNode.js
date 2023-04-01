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
import { map } from 'lodash-es';
import Anchor from '../Anchor';
import BaseText from '../text/BaseText';
import { ElementState, EventType, OverlapMode } from '../../constant/constant';
import { StepDrag } from '../../util/drag';
import { snapToGrid } from '../../util/geometry';
import { isIe } from '../../util/browser';
import { isMultipleSelect } from '../../util/graph';
import { cancelRaf, createRaf } from '../../util/raf';
var BaseNode = /** @class */ (function (_super) {
    __extends(BaseNode, _super);
    function BaseNode(props) {
        var _this = _super.call(this) || this;
        _this.onDragStart = function (_a) {
            var _b = _a.event, clientX = _b.clientX, clientY = _b.clientY;
            var _c = _this.props, model = _c.model, graphModel = _c.graphModel;
            var _d = graphModel.getPointByClient({
                x: clientX,
                y: clientY,
            }).canvasOverlayPosition, x = _d.x, y = _d.y;
            _this.moveOffset = {
                x: model.x - x,
                y: model.y - y,
            };
        };
        _this.onDraging = function (_a) {
            var event = _a.event;
            var _b = _this.props, model = _b.model, graphModel = _b.graphModel;
            // const { isDragging } = model;
            var _c = graphModel.editConfigModel, stopMoveGraph = _c.stopMoveGraph, autoExpand = _c.autoExpand, transformModel = graphModel.transformModel, width = graphModel.width, height = graphModel.height, gridSize = graphModel.gridSize;
            model.isDragging = true;
            var clientX = event.clientX, clientY = event.clientY;
            var _d = graphModel.getPointByClient({
                x: clientX,
                y: clientY,
            }).canvasOverlayPosition, x = _d.x, y = _d.y;
            var _e = __read(transformModel.CanvasPointToHtmlPoint([x, y]), 2), x1 = _e[0], y1 = _e[1];
            // 1. 考虑画布被缩放
            // 2. 考虑鼠标位置不再节点中心
            x = x + _this.moveOffset.x;
            y = y + _this.moveOffset.y;
            // 将x, y移动到grid上
            x = snapToGrid(x, gridSize);
            y = snapToGrid(y, gridSize);
            if (!width || !height) {
                graphModel.moveNode2Coordinate(model.id, x, y);
                return;
            }
            var isOutCanvas = x1 < 0 || y1 < 0 || x1 > width || y1 > height;
            if (autoExpand && !stopMoveGraph && isOutCanvas) { // 鼠标超出画布后的拖动，不处理，而是让上一次setInterval持续滚动画布
                return;
            }
            // 取节点左上角和右下角，计算节点移动是否超出范围
            var _f = __read(transformModel.CanvasPointToHtmlPoint([x - model.width / 2, y - model.height / 2]), 2), leftTopX = _f[0], leftTopY = _f[1];
            var _g = __read(transformModel.CanvasPointToHtmlPoint([x + model.width / 2, y + model.height / 2]), 2), rightBottomX = _g[0], rightBottomY = _g[1];
            var size = Math.max(gridSize, 20);
            var nearBoundary = [];
            if (leftTopX < 0) {
                nearBoundary = [size, 0];
            }
            else if (rightBottomX > graphModel.width) {
                nearBoundary = [-size, 0];
            }
            else if (leftTopY < 0) {
                nearBoundary = [0, size];
            }
            else if (rightBottomY > graphModel.height) {
                nearBoundary = [0, -size];
            }
            if (_this.t) {
                cancelRaf(_this.t);
            }
            if (nearBoundary.length > 0 && !stopMoveGraph && autoExpand) {
                _this.t = createRaf(function () {
                    var _a = __read(nearBoundary, 2), translateX = _a[0], translateY = _a[1];
                    transformModel.translate(translateX, translateY);
                    graphModel.moveNode(model.id, -translateX / transformModel.SCALE_X, -translateY / transformModel.SCALE_X);
                });
            }
            else {
                graphModel.moveNode2Coordinate(model.id, x, y);
            }
        };
        _this.onDragEnd = function () {
            if (_this.t) {
                cancelRaf(_this.t);
            }
            var model = _this.props.model;
            model.isDragging = false;
        };
        _this.handleClick = function (e) {
            // 节点拖拽进画布之后，不触发click事件相关emit
            // 点拖拽进画布没有触发mousedown事件，没有startTime，用这个值做区分
            if (!_this.startTime)
                return;
            var time = new Date().getTime() - _this.startTime;
            if (time > 200)
                return; // 事件大于200ms，认为是拖拽, 不触发click事件。
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            // 节点数据，多为事件对象数据抛出
            var nodeData = model.getData();
            var position = graphModel.getPointByClient({
                x: e.clientX,
                y: e.clientY,
            });
            var eventOptions = {
                data: nodeData,
                e: e,
                position: position,
            };
            var isRightClick = e.button === 2;
            // 这里 IE 11不能正确显示
            var isDoubleClick = e.detail === 2;
            // 判断是否有右击，如果有右击则取消点击事件触发
            if (isRightClick)
                return;
            var editConfigModel = graphModel.editConfigModel;
            graphModel.selectNodeById(model.id, isMultipleSelect(e, editConfigModel));
            _this.toFront();
            // 不是双击的，默认都是单击
            if (isDoubleClick) {
                if (editConfigModel.nodeTextEdit && model.text.editable) {
                    model.setSelected(false);
                    graphModel.setElementStateById(model.id, ElementState.TEXT_EDIT);
                }
                graphModel.eventCenter.emit(EventType.NODE_DBCLICK, eventOptions);
            }
            else {
                graphModel.eventCenter.emit(EventType.ELEMENT_CLICK, eventOptions);
                graphModel.eventCenter.emit(EventType.NODE_CLICK, eventOptions);
            }
        };
        _this.handleContextMenu = function (ev) {
            ev.preventDefault();
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            // 节点数据，多为事件对象数据抛出
            var nodeData = model.getData();
            var position = graphModel.getPointByClient({
                x: ev.clientX,
                y: ev.clientY,
            });
            graphModel.setElementStateById(model.id, ElementState.SHOW_MENU, position.domOverlayPosition);
            graphModel.selectNodeById(model.id);
            graphModel.eventCenter.emit(EventType.NODE_CONTEXTMENU, {
                data: nodeData,
                e: ev,
                position: position,
            });
            _this.toFront();
        };
        _this.handleMouseDown = function (ev) {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            _this.startTime = new Date().getTime();
            var editConfigModel = graphModel.editConfigModel;
            if (editConfigModel.adjustNodePosition && model.draggable) {
                _this.stepDrag && _this.stepDrag.handleMouseDown(ev);
            }
        };
        // 为什么将hover状态放到model中？
        // 因为自定义节点的时候，可能会基于hover状态自定义不同的样式。
        _this.setHoverON = function (ev) {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            if (model.isHovered)
                return;
            var nodeData = model.getData();
            model.setHovered(true);
            graphModel.eventCenter.emit(EventType.NODE_MOUSEENTER, {
                data: nodeData,
                e: ev,
            });
        };
        _this.setHoverOFF = function (ev) {
            var _a = _this.props, model = _a.model, graphModel = _a.graphModel;
            var nodeData = model.getData();
            if (!model.isHovered)
                return;
            model.setHovered(false);
            graphModel.eventCenter.emit(EventType.NODE_MOUSELEAVE, {
                data: nodeData,
                e: ev,
            });
        };
        _this.onMouseOut = function (ev) {
            if (isIe) {
                _this.setHoverOFF(ev);
            }
        };
        var _a = props.graphModel, gridSize = _a.gridSize, eventCenter = _a.eventCenter, model = props.model;
        // 不在构造函数中判断，因为editConfig可能会被动态改变
        _this.stepDrag = new StepDrag({
            onDragStart: _this.onDragStart,
            onDraging: _this.onDraging,
            onDragEnd: _this.onDragEnd,
            step: gridSize,
            eventType: 'NODE',
            isStopPropagation: false,
            eventCenter: eventCenter,
            model: model,
        });
        return _this;
    }
    BaseNode.getModel = function (defaultModel) {
        return defaultModel;
    };
    BaseNode.prototype.getAnchorShape = function (anchorData) {
        return null;
    };
    BaseNode.prototype.getAnchors = function () {
        var _this = this;
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var isSelected = model.isSelected, isHitable = model.isHitable, isDragging = model.isDragging, isShowAnchor = model.isShowAnchor;
        if (isHitable && (isSelected || isShowAnchor) && !isDragging) {
            return map(model.anchors, function (anchor, index) {
                var edgeStyle = model.getAnchorLineStyle(anchor);
                var style = model.getAnchorStyle(anchor);
                return (h(Anchor, { anchorData: anchor, node: _this, style: style, edgeStyle: edgeStyle, anchorIndex: index, nodeModel: model, graphModel: graphModel, setHoverOFF: _this.setHoverOFF }));
            });
        }
        return [];
    };
    BaseNode.prototype.getText = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        // 文本被编辑的时候，显示编辑框，不显示文本。
        if (model.state === ElementState.TEXT_EDIT) {
            return '';
        }
        if (model.text) {
            var editConfigModel = graphModel.editConfigModel;
            var draggable = false;
            if (model.text.draggable || editConfigModel.nodeTextDraggable) {
                draggable = true;
            }
            return (h(BaseText, { editable: editConfigModel.nodeTextEdit && model.text.editable, model: model, graphModel: graphModel, draggable: draggable }));
        }
    };
    BaseNode.prototype.getStateClassName = function () {
        var _a = this.props.model, state = _a.state, isDraging = _a.isDraging, isSelected = _a.isSelected;
        var className = 'lf-node';
        switch (state) {
            case ElementState.ALLOW_CONNECT:
                className += ' lf-node-allow';
                break;
            case ElementState.NOT_ALLOW_CONNECT:
                className += ' lf-node-not-allow';
                break;
            default:
                className += ' lf-node-default';
                break;
        }
        if (isDraging) {
            className += ' lf-isDragging';
        }
        if (isSelected) {
            className += ' lf-node-selected';
        }
        return className;
    };
    /**
     * 节点置顶，可以被某些不需要置顶的节点重写，如group节点。
     */
    BaseNode.prototype.toFront = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var overlapMode = graphModel.overlapMode;
        if (overlapMode !== OverlapMode.INCREASE && model.autoToFront) {
            graphModel.toFront(model.id);
        }
    };
    BaseNode.prototype.render = function () {
        var _a = this.props, model = _a.model, graphModel = _a.graphModel;
        var _b = graphModel.editConfigModel, hideAnchors = _b.hideAnchors, adjustNodePosition = _b.adjustNodePosition, gridSize = graphModel.gridSize, SCALE_X = graphModel.transformModel.SCALE_X;
        var isHitable = model.isHitable, draggable = model.draggable;
        var nodeShapeInner = (h("g", { className: "lf-node-content" },
            this.getShape(),
            this.getText(),
            hideAnchors ? null : this.getAnchors()));
        var nodeShape;
        if (!isHitable) {
            nodeShape = (h("g", { className: this.getStateClassName() }, nodeShapeInner));
        }
        else {
            if (adjustNodePosition && draggable) {
                this.stepDrag.setStep(gridSize * SCALE_X);
            }
            nodeShape = (h("g", { className: this.getStateClassName(), onMouseDown: this.handleMouseDown, onClick: this.handleClick, onMouseEnter: this.setHoverON, onMouseOver: this.setHoverON, onMouseLeave: this.setHoverOFF, onMouseOut: this.onMouseOut, onContextMenu: this.handleContextMenu }, nodeShapeInner));
        }
        return nodeShape;
    };
    return BaseNode;
}(Component));
export default BaseNode;
