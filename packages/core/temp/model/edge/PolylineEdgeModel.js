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
import { observable, action } from 'mobx';
import { cloneDeep } from 'lodash-es';
import { ModelType, SegmentDirection } from '../../constant/constant';
import { isInNode, distance, getClosestRadiusCenter, inStraightLineOfRect, getCrossPointWithCircle, getCrossPointWithEllipse, getCrossPointWithPolyone, } from '../../util/node';
import { getPolylinePoints, getLongestEdge, getCrossPointInRect, isSegmentsInNode, isSegmentsCrossNode, segmentDirection, points2PointsList, pointFilter, } from '../../util/edge';
import BaseEdgeModel from './BaseEdgeModel';
export { PolylineEdgeModel };
var PolylineEdgeModel = /** @class */ (function (_super) {
    __extends(PolylineEdgeModel, _super);
    function PolylineEdgeModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modelType = ModelType.POLYLINE_EDGE;
        return _this;
    }
    PolylineEdgeModel.prototype.initEdgeData = function (data) {
        this.offset = 30;
        _super.prototype.initEdgeData.call(this, data);
    };
    PolylineEdgeModel.prototype.getEdgeStyle = function () {
        var polyline = this.graphModel.theme.polyline;
        var style = _super.prototype.getEdgeStyle.call(this);
        return __assign(__assign({}, style), cloneDeep(polyline));
    };
    PolylineEdgeModel.prototype.getTextPosition = function () {
        var _a;
        // 在文案为空的情况下，文案位置为双击位置
        var textValue = (_a = this.text) === null || _a === void 0 ? void 0 : _a.value;
        if (this.dbClickPosition && !textValue) {
            var _b = this.dbClickPosition, x = _b.x, y = _b.y;
            return {
                x: x, y: y,
            };
        }
        var currentPositionList = points2PointsList(this.points);
        var _c = __read(getLongestEdge(currentPositionList), 2), p1 = _c[0], p2 = _c[1];
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
        };
    };
    // 获取下一个锚点
    PolylineEdgeModel.prototype.getAfterAnchor = function (direction, position, anchorList) {
        var anchor;
        var minDistance;
        anchorList.forEach(function (item) {
            var distanceX;
            if (direction === SegmentDirection.HORIZONTAL) {
                distanceX = Math.abs(position.y - item.y);
            }
            else if (direction === SegmentDirection.VERTICAL) {
                distanceX = Math.abs(position.x - item.x);
            }
            if (!minDistance || minDistance > distanceX) {
                minDistance = distanceX;
                anchor = item;
            }
        });
        return anchor;
    };
    /* 获取拖拽过程中产生的交点 */
    PolylineEdgeModel.prototype.getCorssPoint = function (direction, start, end) {
        var position;
        if (direction === SegmentDirection.HORIZONTAL) {
            position = {
                x: end.x,
                y: start.y,
            };
        }
        else if (direction === SegmentDirection.VERTICAL) {
            position = {
                x: start.x,
                y: end.y,
            };
        }
        return position;
    };
    // 删除在图形内的过个交点
    PolylineEdgeModel.prototype.removeCrossPoints = function (startIndex, endIndex, pointList) {
        var list = pointList.map(function (i) { return i; });
        if (startIndex === 1) {
            var start_1 = list[startIndex];
            var end = list[endIndex];
            var pre_1 = list[startIndex - 1];
            var isInStartNode = isSegmentsInNode(pre_1, start_1, this.sourceNode);
            if (isInStartNode) {
                var isSegmentsCrossStartNode = isSegmentsCrossNode(start_1, end, this.sourceNode);
                if (isSegmentsCrossStartNode) {
                    var point = getCrossPointInRect(start_1, end, this.sourceNode);
                    if (point) {
                        list[startIndex] = point;
                        list.splice(startIndex - 1, 1);
                        startIndex--;
                        endIndex--;
                    }
                }
            }
            else {
                var anchorList = this.sourceNode.anchors;
                anchorList.forEach(function (item) {
                    if ((item.x === pre_1.x && item.x === start_1.x)
                        || (item.y === pre_1.y && item.y === start_1.y)) {
                        var distance1 = distance(item.x, item.y, start_1.x, start_1.y);
                        var distance2 = distance(pre_1.x, pre_1.y, start_1.x, start_1.y);
                        if (distance1 < distance2) {
                            list[startIndex - 1] = item;
                        }
                    }
                });
            }
        }
        if (endIndex === pointList.length - 2) {
            var start = list[startIndex];
            var end_1 = list[endIndex];
            var next_1 = list[endIndex + 1];
            var isInEndNode = isSegmentsInNode(end_1, next_1, this.targetNode);
            if (isInEndNode) {
                var isSegmentsCrossStartNode = isSegmentsCrossNode(start, end_1, this.targetNode);
                if (isSegmentsCrossStartNode) {
                    var point = getCrossPointInRect(start, end_1, this.targetNode);
                    if (point) {
                        list[endIndex] = point;
                        list.splice(endIndex + 1, 1);
                    }
                }
            }
            else {
                var anchorList = this.targetNode.anchors;
                anchorList.forEach(function (item) {
                    if ((item.x === next_1.x && item.x === end_1.x)
                        || (item.y === next_1.y && item.y === end_1.y)) {
                        var distance1 = distance(item.x, item.y, end_1.x, end_1.y);
                        var distance2 = distance(next_1.x, next_1.y, end_1.x, end_1.y);
                        if (distance1 < distance2) {
                            list[endIndex + 1] = item;
                        }
                    }
                });
            }
        }
        return list;
    };
    // 获取在拖拽过程中可能产生的点
    PolylineEdgeModel.prototype.getDragingPoints = function (direction, positioType, position, anchorList, draginngPointList) {
        var pointList = draginngPointList.map(function (i) { return i; });
        var anchor = this.getAfterAnchor(direction, position, anchorList);
        var crossPoint = this.getCorssPoint(direction, position, anchor);
        if (positioType === 'start') {
            pointList.unshift(crossPoint);
            pointList.unshift(anchor);
        }
        else {
            pointList.push(crossPoint);
            pointList.push(anchor);
        }
        return pointList;
    };
    // 更新相交点[起点，终点]，更加贴近图形, 未修改observable不作为action
    PolylineEdgeModel.prototype.updateCrossPoints = function (pointList) {
        var list = pointList.map(function (i) { return i; });
        var start = pointList[0];
        var next = pointList[1];
        var pre = pointList[list.length - 2];
        var end = pointList[list.length - 1];
        var _a = this, sourceNode = _a.sourceNode, targetNode = _a.targetNode;
        var sourceModelType = sourceNode.modelType;
        var targetModelType = targetNode.modelType;
        var startPointDirection = segmentDirection(start, next);
        var startCrossPoint = list[0];
        switch (sourceModelType) {
            case ModelType.RECT_NODE:
                if (sourceNode.radius !== 0) {
                    var inInnerNode = inStraightLineOfRect(start, sourceNode);
                    if (!inInnerNode) {
                        startCrossPoint = getClosestRadiusCenter(start, startPointDirection, sourceNode);
                    }
                }
                break;
            case ModelType.CIRCLE_NODE:
                startCrossPoint = getCrossPointWithCircle(start, startPointDirection, sourceNode);
                break;
            case ModelType.ELLIPSE_NODE:
                startCrossPoint = getCrossPointWithEllipse(start, startPointDirection, sourceNode);
                break;
            case ModelType.DIAMOND_NODE:
                startCrossPoint = getCrossPointWithPolyone(start, startPointDirection, sourceNode);
                break;
            case ModelType.POLYGON_NODE:
                startCrossPoint = getCrossPointWithPolyone(start, startPointDirection, sourceNode);
                break;
            default:
                break;
        }
        list[0] = startCrossPoint;
        var endPointDirection = segmentDirection(pre, end);
        var endCrossPoint = list[list.length - 1];
        switch (targetModelType) {
            case ModelType.RECT_NODE:
                if (targetNode.radius !== 0) {
                    var inInnerNode = inStraightLineOfRect(end, targetNode);
                    if (!inInnerNode) {
                        endCrossPoint = getClosestRadiusCenter(end, endPointDirection, targetNode);
                    }
                }
                break;
            case ModelType.CIRCLE_NODE:
                endCrossPoint = getCrossPointWithCircle(end, endPointDirection, targetNode);
                break;
            case ModelType.ELLIPSE_NODE:
                endCrossPoint = getCrossPointWithEllipse(end, endPointDirection, targetNode);
                break;
            case ModelType.DIAMOND_NODE:
                endCrossPoint = getCrossPointWithPolyone(end, endPointDirection, targetNode);
                break;
            case ModelType.POLYGON_NODE:
                endCrossPoint = getCrossPointWithPolyone(end, endPointDirection, targetNode);
                break;
            default:
                break;
        }
        list[list.length - 1] = endCrossPoint;
        return list;
    };
    PolylineEdgeModel.prototype.getData = function () {
        var data = _super.prototype.getData.call(this);
        var pointsList = this.pointsList.map(function (_a) {
            var x = _a.x, y = _a.y;
            return ({ x: x, y: y });
        });
        return Object.assign({}, data, {
            pointsList: pointsList,
        });
    };
    PolylineEdgeModel.prototype.initPoints = function () {
        if (this.pointsList.length > 0) {
            this.points = this.pointsList.map(function (point) { return point.x + "," + point.y; }).join(' ');
        }
        else {
            this.updatePoints();
        }
    };
    PolylineEdgeModel.prototype.updatePoints = function () {
        var pointsList = getPolylinePoints({ x: this.startPoint.x, y: this.startPoint.y }, { x: this.endPoint.x, y: this.endPoint.y }, this.sourceNode, this.targetNode, this.offset || 0);
        this.pointsList = pointsList;
        this.points = pointsList.map(function (point) { return point.x + "," + point.y; }).join(' ');
    };
    PolylineEdgeModel.prototype.updateStartPoint = function (anchor) {
        this.startPoint = anchor;
        this.updatePoints();
    };
    PolylineEdgeModel.prototype.moveStartPoint = function (deltaX, deltaY) {
        this.startPoint.x += deltaX;
        this.startPoint.y += deltaY;
        this.updatePoints();
        // todo: 尽量保持边的整体轮廓, 通过deltaX和deltaY更新pointsList，而不是重新计算。
    };
    PolylineEdgeModel.prototype.updateEndPoint = function (anchor) {
        this.endPoint = anchor;
        this.updatePoints();
    };
    PolylineEdgeModel.prototype.moveEndPoint = function (deltaX, deltaY) {
        this.endPoint.x += deltaX;
        this.endPoint.y += deltaY;
        this.updatePoints();
    };
    PolylineEdgeModel.prototype.dragAppendStart = function () {
        // mobx observer 对象被iterator处理会有问题
        this.draginngPointList = this.pointsList.map(function (i) { return i; });
    };
    PolylineEdgeModel.prototype.dragAppendSimple = function (appendInfo, dragInfo) {
        // 因为drag事件是mouseDown事件触发的，因此当真实拖拽之后再设置isDragging
        // 避免因为点击事件造成，在dragStart触发之后，没有触发dragEnd错误设置了isDragging状态，对history计算造成错误
        this.isDragging = true;
        var start = appendInfo.start, end = appendInfo.end, startIndex = appendInfo.startIndex, endIndex = appendInfo.endIndex, direction = appendInfo.direction;
        var pointsList = this.pointsList;
        var draginngPointList = pointsList;
        if (direction === SegmentDirection.HORIZONTAL) {
            // 水平，仅调整y坐标，拿到当前线段两个端点移动后的坐标
            pointsList[startIndex] = { x: start.x, y: start.y + dragInfo.y };
            pointsList[endIndex] = { x: end.x, y: end.y + dragInfo.y };
            draginngPointList = this.pointsList.map(function (i) { return i; });
        }
        else if (direction === SegmentDirection.VERTICAL) {
            // 垂直，仅调整x坐标， 与水平调整同理
            pointsList[startIndex] = { x: start.x + dragInfo.x, y: start.y };
            pointsList[endIndex] = { x: end.x + dragInfo.x, y: end.y };
            draginngPointList = this.pointsList.map(function (i) { return i; });
        }
        this.updatePointsAfterDrage(draginngPointList);
        this.draginngPointList = draginngPointList;
        this.setText(Object.assign({}, this.text, this.textPosition));
        return {
            start: Object.assign({}, pointsList[startIndex]),
            end: Object.assign({}, pointsList[endIndex]),
            startIndex: startIndex,
            endIndex: endIndex,
            direction: direction,
        };
    };
    PolylineEdgeModel.prototype.dragAppend = function (appendInfo, dragInfo) {
        this.isDragging = true;
        var start = appendInfo.start, end = appendInfo.end, startIndex = appendInfo.startIndex, endIndex = appendInfo.endIndex, direction = appendInfo.direction;
        var pointsList = this.pointsList;
        if (direction === SegmentDirection.HORIZONTAL) {
            // 水平，仅调整y坐标
            // step1: 拿到当前线段两个端点移动后的坐标
            pointsList[startIndex] = { x: start.x, y: start.y + dragInfo.y };
            pointsList[endIndex] = { x: end.x, y: end.y + dragInfo.y };
            // step2: 计算拖拽后,两个端点与节点外框的交点
            // 定义一个拖住中节点list
            var draginngPointList = this.pointsList.map(function (i) { return i; });
            if (startIndex !== 0 && endIndex !== this.pointsList.length - 1) {
                // 2.1)如果线段没有连接起终点，过滤会穿插在图形内部的线段，取整个图形离线段最近的点
                draginngPointList = this.removeCrossPoints(startIndex, endIndex, draginngPointList);
            }
            if (startIndex === 0) {
                // 2.2)如果线段连接了起点, 判断起点是否在节点内部
                var startPosition = {
                    x: start.x, y: start.y + dragInfo.y,
                };
                var inNode = isInNode(startPosition, this.sourceNode);
                if (!inNode) {
                    // 如果不在节点内部，更换起点为线段与节点的交点
                    var anchorList = this.sourceNode.anchors;
                    draginngPointList = this.getDragingPoints(direction, 'start', startPosition, anchorList, draginngPointList);
                }
            }
            if (endIndex === this.pointsList.length - 1) {
                // 2.2)如果线段连接了终点, 判断起点是否在节点内部
                var endPosition = {
                    x: end.x, y: end.y + dragInfo.y,
                };
                var inNode = isInNode(endPosition, this.targetNode);
                if (!inNode) {
                    // 如果不在节点内部，更换终点为线段与节点的交点
                    var anchorList = this.targetNode.anchors;
                    draginngPointList = this.getDragingPoints(direction, 'end', endPosition, anchorList, draginngPointList);
                }
            }
            draginngPointList = pointFilter(draginngPointList);
            this.updatePointsAfterDrage(draginngPointList);
            // step3: 调整到对应外框的位置后，执行updatePointsAfterDrage，找到当前线段和图形的准确交点
            this.draginngPointList = draginngPointList;
        }
        else if (direction === SegmentDirection.VERTICAL) {
            // 垂直，仅调整x坐标， 与水平调整同理
            pointsList[startIndex] = { x: start.x + dragInfo.x, y: start.y };
            pointsList[endIndex] = { x: end.x + dragInfo.x, y: end.y };
            var draginngPointList = this.pointsList.map(function (i) { return i; });
            if (startIndex !== 0 && endIndex !== this.pointsList.length - 1) {
                draginngPointList = this.removeCrossPoints(startIndex, endIndex, draginngPointList);
            }
            if (startIndex === 0) {
                var startPosition = {
                    x: start.x + dragInfo.x, y: start.y,
                };
                var inNode = isInNode(startPosition, this.sourceNode);
                if (!inNode) {
                    var anchorList = this.sourceNode.anchors;
                    draginngPointList = this.getDragingPoints(direction, 'start', startPosition, anchorList, draginngPointList);
                }
            }
            if (endIndex === this.pointsList.length - 1) {
                var endPosition = {
                    x: end.x + dragInfo.x, y: end.y,
                };
                var inNode = isInNode(endPosition, this.targetNode);
                if (!inNode) {
                    var anchorList = this.targetNode.anchors;
                    draginngPointList = this.getDragingPoints(direction, 'end', endPosition, anchorList, draginngPointList);
                }
            }
            draginngPointList = pointFilter(draginngPointList);
            this.updatePointsAfterDrage(draginngPointList);
            this.draginngPointList = draginngPointList;
        }
        this.setText(Object.assign({}, this.text, this.textPosition));
        return {
            start: Object.assign({}, pointsList[startIndex]),
            end: Object.assign({}, pointsList[endIndex]),
            startIndex: startIndex,
            endIndex: endIndex,
            direction: direction,
        };
    };
    PolylineEdgeModel.prototype.dragAppendEnd = function () {
        if (this.draginngPointList) {
            var pointsList = points2PointsList(this.points);
            // 更新pointsList，重新渲染appendWidth
            this.pointsList = pointsList.map(function (i) { return i; });
            // draginngPointList清空
            this.draginngPointList = [];
            // 更新起终点
            var startPoint = pointsList[0];
            this.startPoint = Object.assign({}, startPoint);
            var endPoint = pointsList[pointsList.length - 1];
            this.endPoint = Object.assign({}, endPoint);
        }
        this.isDragging = false;
    };
    /* 拖拽之后个更新points，仅更新边，不更新pointsList，
       appendWidth会依赖pointsList,更新pointsList会重新渲染appendWidth，从而导致不能继续拖拽
       在拖拽结束后再进行pointsList的更新
    */
    PolylineEdgeModel.prototype.updatePointsAfterDrage = function (pointsList) {
        // 找到准确的连接点后,更新points, 更新边，同时更新依赖points的箭头
        var list = this.updateCrossPoints(pointsList);
        this.points = list.map(function (point) { return point.x + "," + point.y; }).join(' ');
    };
    // 获取边调整的起点
    PolylineEdgeModel.prototype.getAdjustStart = function () {
        return this.pointsList[0] || this.startPoint;
    };
    // 获取边调整的终点
    PolylineEdgeModel.prototype.getAdjustEnd = function () {
        var pointsList = this.pointsList;
        return pointsList[pointsList.length - 1] || this.endPoint;
    };
    // 起终点拖拽调整过程中，进行折线路径更新
    PolylineEdgeModel.prototype.updateAfterAdjustStartAndEnd = function (_a) {
        var startPoint = _a.startPoint, endPoint = _a.endPoint, sourceNode = _a.sourceNode, targetNode = _a.targetNode;
        var pointsList = getPolylinePoints({ x: startPoint.x, y: startPoint.y }, { x: endPoint.x, y: endPoint.y }, sourceNode, targetNode, this.offset || 0);
        this.pointsList = pointsList;
        this.initPoints();
    };
    __decorate([
        observable
    ], PolylineEdgeModel.prototype, "dbClickPosition", void 0);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "initPoints", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "updatePoints", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "updateStartPoint", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "moveStartPoint", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "updateEndPoint", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "moveEndPoint", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "dragAppendStart", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "dragAppendSimple", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "dragAppend", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "dragAppendEnd", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "updatePointsAfterDrage", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "getAdjustStart", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "getAdjustEnd", null);
    __decorate([
        action
    ], PolylineEdgeModel.prototype, "updateAfterAdjustStartAndEnd", null);
    return PolylineEdgeModel;
}(BaseEdgeModel));
export default PolylineEdgeModel;
