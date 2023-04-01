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
import { action, observable } from 'mobx';
import { assign } from 'lodash-es';
import { getNodeBBox } from '../util/node';
var SnaplineModel = /** @class */ (function () {
    function SnaplineModel(graphModel) {
        this.isShowHorizontal = false;
        this.isShowVertical = false;
        this.position = { x: 0, y: 0 };
        this.graphModel = graphModel;
    }
    SnaplineModel.prototype.getStyle = function () {
        return __assign({}, this.graphModel.theme.snapline);
    };
    // 计算节点中心线与其他节点的对齐信息
    SnaplineModel.prototype.getCenterSnapLine = function (dragingNode, nodes) {
        var x = dragingNode.x, y = dragingNode.y;
        var isShowVertical = false;
        var isShowHorizontal = false;
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            // 排除当前节点
            if (item.id !== dragingNode.id) {
                if (x === item.x) {
                    isShowVertical = true;
                }
                if (y === item.y) {
                    isShowHorizontal = true;
                }
                // 如果水平垂直都显示，则停止循环。减少不必要的遍历
                if (isShowVertical && isShowHorizontal) {
                    break;
                }
            }
        }
        return ({
            isShowVertical: isShowVertical,
            isShowHorizontal: isShowHorizontal,
            position: { x: x, y: y },
        });
    };
    // 计算节点上下边框与其他节点的上下边框的对齐信息
    SnaplineModel.prototype.getHorizontalSnapline = function (dragingNode, nodes) {
        var isShowHorizontal = false;
        var horizontalY;
        var id = dragingNode.id;
        var dragingData;
        if (id) {
            var fakerNode = this.graphModel.fakerNode;
            if (fakerNode && fakerNode.id === id) {
                dragingData = getNodeBBox(fakerNode);
            }
            else {
                var nodeModel = this.graphModel.getNodeModelById(id);
                dragingData = getNodeBBox(nodeModel);
            }
        }
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            // 排除当前节点
            if (item.id !== dragingNode.id) {
                var itemData = getNodeBBox(item);
                // 如果节点的最大最小Y轴坐标与节点的最大最小Y轴坐标相等，展示水平线
                if (itemData.minY === dragingData.minY
                    || itemData.maxY === dragingData.minY) {
                    // 找到则停止循环。减少不必要的遍历
                    isShowHorizontal = true;
                    horizontalY = dragingData.minY;
                    break;
                }
                if (itemData.minY === dragingData.maxY
                    || itemData.maxY === dragingData.maxY) {
                    isShowHorizontal = true;
                    horizontalY = dragingData.maxY;
                    break;
                }
            }
        }
        return assign({ isShowHorizontal: isShowHorizontal, position: { y: horizontalY } });
    };
    // 计算节点左右边框与其他节点的左右边框的对齐信息
    SnaplineModel.prototype.getVerticalSnapline = function (dragingNode, nodes) {
        var isShowVertical = false;
        var verticalX;
        var id = dragingNode.id;
        var dragingData;
        if (id) {
            var fakerNode = this.graphModel.fakerNode;
            if (fakerNode && fakerNode.id === id) {
                dragingData = getNodeBBox(fakerNode);
            }
            else {
                var nodeModel = this.graphModel.getNodeModelById(id);
                dragingData = getNodeBBox(nodeModel);
            }
        }
        for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            // 排除当前节点
            if (item.id !== dragingNode.id) {
                var itemData = getNodeBBox(item);
                // 如果节点的最大最小X轴坐标与节点的最大最小X轴坐标相等，展示垂直线
                if (itemData.minX === dragingData.minX
                    || itemData.maxX === dragingData.minX) {
                    // 找到则停止循环。减少不必要的遍历
                    isShowVertical = true;
                    verticalX = dragingData.minX;
                    break;
                }
                if (itemData.minX === dragingData.maxX
                    || itemData.maxX === dragingData.maxX) {
                    isShowVertical = true;
                    verticalX = dragingData.maxX;
                    break;
                }
            }
        }
        return assign({ isShowVertical: isShowVertical, position: { x: verticalX } });
    };
    // 计算节点与其他节点的对齐信息
    SnaplineModel.prototype.getSnapLinePosition = function (dragingNode, nodes) {
        var snaplineInfo = this.getCenterSnapLine(dragingNode, nodes);
        var isShowHorizontal = snaplineInfo.isShowHorizontal, isShowVertical = snaplineInfo.isShowVertical;
        // 中心对齐优先级最高
        // 如果没有中心坐标的水平对齐，计算上下边框的对齐
        if (!isShowHorizontal) {
            var horizontalSnapline = this.getHorizontalSnapline(dragingNode, nodes);
            if (horizontalSnapline.isShowHorizontal) {
                snaplineInfo.isShowHorizontal = horizontalSnapline.isShowHorizontal;
                snaplineInfo.position.y = horizontalSnapline.position.y;
            }
        }
        // 如果没有中心坐标的垂直对齐，计算左右边框的对齐
        if (!isShowVertical) {
            var verticalSnapline = this.getVerticalSnapline(dragingNode, nodes);
            if (verticalSnapline.isShowVertical) {
                snaplineInfo.isShowVertical = verticalSnapline.isShowVertical;
                snaplineInfo.position.x = verticalSnapline.position.x;
            }
        }
        return snaplineInfo;
    };
    // 设置对齐信息
    SnaplineModel.prototype.setSnaplineInfo = function (snaplineInfo) {
        var isShowHorizontal = snaplineInfo.isShowHorizontal, isShowVertical = snaplineInfo.isShowVertical, position = snaplineInfo.position;
        this.position = position;
        this.isShowHorizontal = isShowHorizontal;
        this.isShowVertical = isShowVertical;
    };
    // 清空对齐信息，对齐线消失
    SnaplineModel.prototype.clearSnapline = function () {
        this.position = { x: 0, y: 0 };
        this.isShowHorizontal = false;
        this.isShowVertical = false;
    };
    // 设置节点对齐线
    SnaplineModel.prototype.setNodeSnapLine = function (nodeData) {
        var nodes = this.graphModel.nodes;
        var info = this.getSnapLinePosition(nodeData, nodes);
        this.setSnaplineInfo(info);
    };
    __decorate([
        observable
    ], SnaplineModel.prototype, "isShowHorizontal", void 0);
    __decorate([
        observable
    ], SnaplineModel.prototype, "isShowVertical", void 0);
    __decorate([
        observable
    ], SnaplineModel.prototype, "position", void 0);
    __decorate([
        action
    ], SnaplineModel.prototype, "clearSnapline", null);
    __decorate([
        action
    ], SnaplineModel.prototype, "setNodeSnapLine", null);
    return SnaplineModel;
}());
export default SnaplineModel;
export { SnaplineModel };
