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
import { pick } from 'lodash-es';
import { isInSegment } from '../algorithm/edge';
import { SegmentDirection } from '../constant/constant';
import { getBytesLength } from './edge';
/* 获取所有锚点 */
export var getAnchors = function (data) {
    var anchors = data.anchors;
    return anchors;
};
/* 手动边时获取目标节点的信息：目标节点，目标节点的锚点index以及坐标 */
export var targetNodeInfo = function (position, graphModel) {
    var nodes = graphModel.nodes;
    var nodeInfo;
    for (var i = nodes.length - 1; i >= 0; i--) {
        var targetNode = nodes[i];
        var inNode = isInNodeBbox(position, targetNode);
        if (inNode) {
            var anchorInfo = getClosestAnchor(position, targetNode);
            if (anchorInfo) { // 不能连接到没有锚点的节点
                var currentNodeInfo = {
                    node: targetNode,
                    anchorIndex: anchorInfo.index,
                    anchor: anchorInfo.anchor,
                };
                // fix: 489; 多个节点重合时，连线连接上面的那一个。
                if (!nodeInfo || isNodeHigher(targetNode, nodeInfo.node, graphModel)) {
                    nodeInfo = currentNodeInfo;
                }
            }
        }
    }
    return nodeInfo;
};
/**
 * 比较两个节点
 */
var isNodeHigher = function (node1, node2, graphModel) {
    if (node1.zIndex > node2.zIndex) {
        return true;
    }
    if (graphModel.nodesMap[node1.id].index > graphModel.nodesMap[node2.id].index) {
        return true;
    }
    return false;
};
/* 手动边时获取目标节点上，距离目标位置最近的锚点 */
var getClosestAnchor = function (position, node) {
    var anchors = getAnchors(node);
    var closest;
    var minDistance = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < anchors.length; i++) {
        var len = distance(position.x, position.y, anchors[i].x, anchors[i].y);
        if (len < minDistance) {
            minDistance = len;
            closest = {
                index: i,
                anchor: __assign(__assign({}, anchors[i]), { x: anchors[i].x, y: anchors[i].y, id: anchors[i].id }),
            };
        }
    }
    return closest;
};
/* 两点之间距离 */
export var distance = function (x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); };
/* 是否在某个节点内，手否进行连接，有offset控制粒度，与outline有关，可以优化 */
export var isInNode = function (position, node) {
    var inNode = false;
    var offset = 0;
    var bBox = getNodeBBox(node);
    if (position.x >= bBox.minX - offset
        && position.x <= bBox.maxX + offset
        && position.y >= bBox.minY - offset
        && position.y <= bBox.maxY + offset) {
        inNode = true;
    }
    return inNode;
};
export var isInNodeBbox = function (position, node) {
    var inNode = false;
    var offset = 5;
    var bBox = getNodeBBox(node);
    if (position.x >= bBox.minX - offset
        && position.x <= bBox.maxX + offset
        && position.y >= bBox.minY - offset
        && position.y <= bBox.maxY + offset) {
        inNode = true;
    }
    return inNode;
};
/* 获取节点bbox */
export var getNodeBBox = function (node) {
    var x = node.x, y = node.y, width = node.width, height = node.height;
    var bBox = {
        minX: x - width / 2,
        minY: y - height / 2,
        maxX: x + width / 2,
        maxY: y + height / 2,
        x: x,
        y: y,
        width: width,
        height: height,
        centerX: x,
        centerY: y,
    };
    return bBox;
};
export var getRectRadiusCircle = function (node) {
    var _a = node, x = _a.x, y = _a.y, width = _a.width, height = _a.height, radius = _a.radius;
    var radiusCenter = [
        {
            x: x - width / 2 + radius,
            y: y - height / 2 + radius,
            r: radius,
        },
        {
            x: x + width / 2 - radius,
            y: y - height / 2 + radius,
            r: radius,
        },
        {
            x: x - width / 2 + radius,
            y: y + height / 2 - radius,
            r: radius,
        },
        {
            x: x + width / 2 - radius,
            y: y + height / 2 - radius,
            r: radius,
        },
    ];
    return radiusCenter;
};
export var getClosestRadiusCenter = function (point, direction, node) {
    var radiusCenter = getRectRadiusCircle(node);
    var closestRadiusPoint;
    var minDistance = Number.MAX_SAFE_INTEGER;
    radiusCenter.forEach(function (item) {
        var radiusDistance = distance(point.x, point.y, item.x, item.y);
        if (radiusDistance < minDistance) {
            minDistance = radiusDistance;
            closestRadiusPoint = item;
        }
    });
    var corssPoint = getCrossPointWithCircle(point, direction, closestRadiusPoint);
    return corssPoint;
};
/* 求点在垂直或者水平方向上与圆形的交点 */
export var getCrossPointWithCircle = function (point, direction, node) {
    var crossPoint;
    var _a = node, x = _a.x, y = _a.y, r = _a.r;
    if (direction === SegmentDirection.HORIZONTAL) {
        // 水平，x轴
        var crossLeft = x - Math.sqrt(r * r - (point.y - y) * (point.y - y));
        var crossRight = x + Math.sqrt(r * r - (point.y - y) * (point.y - y));
        var crossX = Math.abs(crossLeft - point.x) < Math.abs(crossRight - point.x)
            ? crossLeft
            : crossRight;
        crossPoint = {
            x: crossX,
            y: point.y,
        };
    }
    else if (direction === SegmentDirection.VERTICAL) {
        // 垂直，y轴
        var crossTop = y - Math.sqrt(r * r - (point.x - x) * (point.x - x));
        var crossBottom = y + Math.sqrt(r * r - (point.x - x) * (point.x - x));
        var crossY = Math.abs(crossTop - point.y) < Math.abs(crossBottom - point.y)
            ? crossTop
            : crossBottom;
        crossPoint = {
            x: point.x,
            y: crossY,
        };
    }
    return crossPoint;
};
/* 判断点所在边的方向 */
export var pointEdgeDirection = function (point, node) {
    var dx = Math.abs(point.x - node.x);
    var dy = Math.abs(point.y - node.y);
    return dx / node.width > dy / node.height
        ? SegmentDirection.VERTICAL
        : SegmentDirection.HORIZONTAL;
};
// 判断矩形外框上一点是否在矩形直行线上
export var inStraightLineOfRect = function (point, node) {
    var rect = node;
    var isInStraight = false;
    var rectStragit = {
        minX: rect.x - rect.width / 2 + rect.radius,
        maxX: rect.x + rect.width / 2 - rect.radius,
        minY: rect.y - rect.height / 2 + rect.radius,
        maxY: rect.y + rect.height / 2 - rect.radius,
    };
    var x = rect.x, y = rect.y, width = rect.width, height = rect.height;
    if (point.y === y + (height / 2) || point.y === y - (height / 2)) {
        isInStraight = point.x > rectStragit.minX && point.x < rectStragit.maxX;
    }
    else if (point.x === x + (width / 2) || point.x === x - (width / 2)) {
        isInStraight = point.y > rectStragit.minY && point.y < rectStragit.maxY;
    }
    return isInStraight;
};
/* 求点在垂直或者水平方向上与椭圆的交点 */
export var getCrossPointWithEllipse = function (point, direction, node) {
    var crossPoint;
    var _a = node, x = _a.x, y = _a.y, rx = _a.rx, ry = _a.ry;
    if (direction === SegmentDirection.HORIZONTAL) {
        // 水平
        var crossLeft = x
            - Math.sqrt(rx * rx - ((point.y - y) * (point.y - y) * rx * rx) / (ry * ry));
        var crossRight = x
            + Math.sqrt(rx * rx - ((point.y - y) * (point.y - y) * rx * rx) / (ry * ry));
        var crossX = Math.abs(crossLeft - point.x) < Math.abs(crossRight - point.x)
            ? crossLeft
            : crossRight;
        crossPoint = {
            x: crossX,
            y: point.y,
        };
    }
    else if (direction === SegmentDirection.VERTICAL) {
        // 垂直
        var crossTop = y
            - Math.sqrt(ry * ry - ((point.x - x) * (point.x - x) * ry * ry) / (rx * rx));
        var crossBottom = y
            + Math.sqrt(ry * ry - ((point.x - x) * (point.x - x) * ry * ry) / (rx * rx));
        var crossY = Math.abs(crossTop - point.y) < Math.abs(crossBottom - point.y)
            ? crossTop
            : crossBottom;
        crossPoint = {
            x: point.x,
            y: crossY,
        };
    }
    return crossPoint;
};
/* 求点在垂直或者水平方向上与多边形的交点 */
export var getCrossPointWithPolyone = function (point, direction, node) {
    var pointsPosition = node.pointsPosition;
    var minDistance = Number.MAX_SAFE_INTEGER;
    var crossPoint;
    var segments = [];
    for (var i = 0; i < pointsPosition.length; i++) {
        segments.push({
            start: pointsPosition[i],
            end: pointsPosition[(i + 1) % pointsPosition.length],
        });
    }
    segments.forEach(function (item) {
        var start = item.start, end = item.end;
        var a = start;
        var b = end;
        if (start.x > end.x) {
            a = end;
            b = start;
        }
        var pointXY = {
            x: point.x,
            y: point.y,
        };
        // 如果多边形当前线段是垂直,求交点
        if (a.x === b.x && direction === SegmentDirection.HORIZONTAL) {
            pointXY = {
                x: a.x,
                y: point.y,
            };
        }
        // 如果多边形当前线段是水平,求交点
        if (a.y === b.y && direction === SegmentDirection.VERTICAL) {
            pointXY = {
                x: point.x,
                y: a.y,
            };
        }
        // 如果线段不是水平或者垂直, 使用向量方程进行计算
        if (a.x !== b.x && a.y !== b.y) {
            var k = (b.y - a.y) / (b.x - a.x);
            var m = (a.x * b.y - b.x * a.y) / (a.x - b.x);
            if (direction === SegmentDirection.HORIZONTAL) {
                pointXY = {
                    x: (point.y - m) / k,
                    y: point.y,
                };
            }
            else if (direction === SegmentDirection.VERTICAL) {
                pointXY = {
                    x: point.x,
                    y: k * point.x + m,
                };
            }
        }
        // 如果交点在线段上
        var inSegment = isInSegment(pointXY, start, end);
        if (inSegment) {
            var currentDistance = distance(pointXY.x, pointXY.y, point.x, point.y);
            if (currentDistance < minDistance) {
                minDistance = currentDistance;
                crossPoint = pointXY;
            }
        }
    });
    return crossPoint;
};
// 规范节点初始化数据
export var pickNodeConfig = function (data) {
    var nodeData = pick(data, [
        'id',
        'type',
        'x',
        'y',
        'text',
        'properties',
        'virtual',
    ]);
    return nodeData;
};
/**
 * 基于节点的边，重新获取新的节点
 */
export var getNodeAnchorPosition = function (center, point, width, height) {
    var x = center.x, y = center.y;
    if (point.x > center.x) {
        x = center.x + width / 2;
    }
    else if (point.x < center.x) {
        x = center.x - width / 2;
    }
    if (point.y > center.y) {
        y = center.y + height / 2;
    }
    else if (point.y < center.y) {
        y = center.y - height / 2;
    }
    return {
        x: x,
        y: y,
    };
};
// 获取文案高度，自动换行，利用dom计算高度
export var getHtmlTextHeight = function (_a) {
    var rows = _a.rows, style = _a.style, rowsLength = _a.rowsLength, className = _a.className;
    var dom = document.createElement('div');
    dom.style.fontSize = style.fontSize;
    dom.style.width = style.width;
    dom.className = className;
    dom.style.lineHeight = style.lineHeight;
    dom.style.padding = style.padding;
    if (style.fontFamily) {
        dom.style.fontFamily = style.fontFamily;
    }
    if (rowsLength > 1) {
        rows.forEach(function (row) {
            var rowDom = document.createElement('div');
            rowDom.textContent = row;
            dom.appendChild(rowDom);
        });
    }
    else {
        dom.textContent = rows;
    }
    document.body.appendChild(dom);
    var height = dom.clientHeight;
    document.body.removeChild(dom);
    return height;
};
// 获取文案高度，自动换行，利用dom计算高度
export var getSvgTextWidthHeight = function (_a) {
    var rows = _a.rows, rowsLength = _a.rowsLength, fontSize = _a.fontSize;
    var longestBytes = 0;
    rows && rows.forEach(function (item) {
        var rowByteLength = getBytesLength(item);
        longestBytes = rowByteLength > longestBytes ? rowByteLength : longestBytes;
    });
    // 背景框宽度，最长一行字节数/2 * fontsize + 2
    // 背景框宽度， 行数 * fontsize + 2
    return {
        width: Math.ceil(longestBytes / 2) * fontSize + fontSize / 4,
        height: rowsLength * (fontSize + 2) + fontSize / 4,
    };
};
/**
 * @description 格式化边校验信息
 */
export var formateAnchorConnectValidateData = function (data) {
    if (typeof data !== 'object') {
        return {
            isAllPass: !!data,
            msg: data ? '' : '不允许连接',
        };
    }
    return data;
};
