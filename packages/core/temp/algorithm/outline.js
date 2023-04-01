import { ModelType } from '../constant/constant';
import { points2PointsList, getBBoxOfPoints, getBezierPoints } from '../util/edge';
// 获取节点的out
export var getNodeOutline = function (_a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    return ({
        x: x - width / 2,
        y: y - height / 2,
        x1: x + width / 2,
        y1: y + height / 2,
    });
};
export var getLineOutline = function (edge) {
    var startPoint = edge.startPoint, endPoint = edge.endPoint;
    var x = (startPoint.x + endPoint.x) / 2;
    var y = (startPoint.y + endPoint.y) / 2;
    var width = Math.abs(startPoint.x - endPoint.x) + 10;
    var height = Math.abs(startPoint.y - endPoint.y) + 10;
    return {
        x: x - width / 2,
        y: y - height / 2,
        x1: x + width / 2,
        y1: y + height / 2,
    };
};
export var getPolylineOutline = function (edge) {
    var points = edge.points;
    var pointsList = points2PointsList(points);
    var bbox = getBBoxOfPoints(pointsList, 8);
    var x = bbox.x, y = bbox.y, width = bbox.width, height = bbox.height;
    return {
        x: x - width / 2,
        y: y - height / 2,
        x1: x + width / 2,
        y1: y + height / 2,
    };
};
export var getBezierOutline = function (edge) {
    var path = edge.path;
    var pointsList = getBezierPoints(path);
    var bbox = getBBoxOfPoints(pointsList, 8);
    var x = bbox.x, y = bbox.y, width = bbox.width, height = bbox.height;
    return {
        x: x - width / 2,
        y: y - height / 2,
        x1: x + width / 2,
        y1: y + height / 2,
    };
};
export var getEdgeOutline = function (edge) {
    if (edge.modelType === ModelType.LINE_EDGE) {
        return getLineOutline(edge);
    }
    if (edge.modelType === ModelType.POLYLINE_EDGE) {
        return getPolylineOutline(edge);
    }
    if (edge.modelType === ModelType.BEZIER_EDGE) {
        return getBezierOutline(edge);
    }
};
