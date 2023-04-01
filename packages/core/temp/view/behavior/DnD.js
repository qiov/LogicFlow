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
import { get } from 'lodash-es';
import { EventType } from '../../constant/constant';
import { snapToGrid } from '../../util/geometry';
var Dnd = /** @class */ (function () {
    function Dnd(params) {
        var _this = this;
        this.stopDrag = function () {
            _this.nodeConfig = null;
            window.document.removeEventListener('mouseup', _this.stopDrag);
        };
        this.dragEnter = function (e) {
            if (!_this.nodeConfig || _this.fakerNode)
                return;
            _this.fakerNode = _this.lf.createFakerNode(__assign(__assign({}, _this.nodeConfig), _this.clientToLocalPoint({ x: e.clientX, y: e.clientY })));
        };
        this.onDragOver = function (e) {
            e.preventDefault();
            if (_this.fakerNode) {
                var _a = _this.clientToLocalPoint({ x: e.clientX, y: e.clientY }), x = _a.x, y = _a.y;
                _this.fakerNode.moveTo(x, y);
                var nodeData = _this.fakerNode.getData();
                _this.lf.setNodeSnapLine(nodeData);
                _this.lf.graphModel.eventCenter.emit(EventType.NODE_DND_DRAG, { data: nodeData });
            }
            return false;
        };
        this.onDragLeave = function () {
            if (_this.fakerNode) {
                _this.lf.removeNodeSnapLine();
                _this.lf.graphModel.removeFakerNode();
                _this.fakerNode = null;
            }
        };
        this.onDrop = function (e) {
            if (!_this.lf.graphModel || !e || !_this.nodeConfig) {
                return;
            }
            var currentNode = _this.lf.addNode(__assign(__assign({}, _this.nodeConfig), _this.clientToLocalPoint({ x: e.clientX, y: e.clientY })));
            e.preventDefault();
            e.stopPropagation();
            _this.nodeConfig = null;
            _this.lf.removeNodeSnapLine();
            _this.lf.graphModel.removeFakerNode();
            _this.fakerNode = null;
            var nodeData = currentNode.getData();
            _this.lf.graphModel.eventCenter.emit(EventType.NODE_DND_ADD, { data: nodeData });
        };
        var lf = params.lf;
        this.lf = lf;
    }
    Dnd.prototype.clientToLocalPoint = function (_a) {
        var x = _a.x, y = _a.y;
        var gridSize = get(this.lf.options, ['grid', 'size']);
        // 处理 container 的 offset 等
        var position = this.lf.graphModel.getPointByClient({ x: x, y: y });
        // 处理缩放和偏移
        var _b = position.canvasOverlayPosition, x1 = _b.x, y1 = _b.y;
        // x, y 对齐到网格的 size
        return { x: snapToGrid(x1, gridSize), y: snapToGrid(y1, gridSize) };
    };
    Dnd.prototype.startDrag = function (nodeConfig) {
        this.nodeConfig = nodeConfig;
        window.document.addEventListener('mouseup', this.stopDrag);
    };
    Dnd.prototype.eventMap = function () {
        return {
            onMouseEnter: this.dragEnter,
            onMouseOver: this.dragEnter,
            onMouseMove: this.onDragOver,
            onMouseLeave: this.onDragLeave,
            // onMouseOut: this.onDragLeave, // IE11
            onMouseUp: this.onDrop,
        };
    };
    return Dnd;
}());
export default Dnd;
