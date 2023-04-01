export var ElementState;
(function (ElementState) {
    ElementState[ElementState["DEFAULT"] = 1] = "DEFAULT";
    ElementState[ElementState["TEXT_EDIT"] = 2] = "TEXT_EDIT";
    ElementState[ElementState["SHOW_MENU"] = 3] = "SHOW_MENU";
    ElementState[ElementState["ALLOW_CONNECT"] = 4] = "ALLOW_CONNECT";
    ElementState[ElementState["NOT_ALLOW_CONNECT"] = 5] = "NOT_ALLOW_CONNECT";
})(ElementState || (ElementState = {}));
export var ClipBoardInfo;
(function (ClipBoardInfo) {
    ClipBoardInfo["KEY"] = "logic-flow";
    ClipBoardInfo["NODE_NAME"] = "lf-node";
    ClipBoardInfo["EDGE_NAME"] = "lf-edge";
})(ClipBoardInfo || (ClipBoardInfo = {}));
export var ModelType;
(function (ModelType) {
    ModelType["NODE"] = "node";
    ModelType["CIRCLE_NODE"] = "circle-node";
    ModelType["POLYGON_NODE"] = "polygon-node";
    ModelType["RECT_NODE"] = "rect-node";
    ModelType["TEXT_NODE"] = "text-node";
    ModelType["ELLIPSE_NODE"] = "ellipse-node";
    ModelType["DIAMOND_NODE"] = "diamond-node";
    ModelType["HTML_NODE"] = "html-node";
    ModelType["EDGE"] = "edge";
    ModelType["LINE_EDGE"] = "line-edge";
    ModelType["POLYLINE_EDGE"] = "polyline-edge";
    ModelType["BEZIER_EDGE"] = "bezier-edge";
    ModelType["GRAPH"] = "graph";
})(ModelType || (ModelType = {}));
// 区分节点还是边
export var ElementType;
(function (ElementType) {
    ElementType["NODE"] = "node";
    ElementType["EDGE"] = "edge";
    ElementType["GRAPH"] = "graph";
})(ElementType || (ElementType = {}));
export var EventType;
(function (EventType) {
    EventType["ELEMENT_CLICK"] = "element:click";
    EventType["NODE_CLICK"] = "node:click";
    EventType["NODE_DBCLICK"] = "node:dbclick";
    EventType["NODE_DELETE"] = "node:delete";
    EventType["NODE_ADD"] = "node:add";
    EventType["NODE_DND_ADD"] = "node:dnd-add";
    EventType["NODE_DND_DRAG"] = "node:dnd-drag";
    EventType["NODE_MOUSEDOWN"] = "node:mousedown";
    EventType["NODE_DRAGSTART"] = "node:dragstart";
    EventType["NODE_DRAG"] = "node:drag";
    EventType["NODE_DROP"] = "node:drop";
    EventType["NODE_MOUSEUP"] = "node:mouseup";
    EventType["NODE_MOUSEMOVE"] = "node:mousemove";
    EventType["NODE_MOUSEENTER"] = "node:mouseenter";
    EventType["NODE_MOUSELEAVE"] = "node:mouseleave";
    EventType["NODE_CONTEXTMENU"] = "node:contextmenu";
    EventType["EDGE_DELETE"] = "edge:delete";
    EventType["EDGE_ADD"] = "edge:add";
    EventType["EDGE_CLICK"] = "edge:click";
    EventType["EDGE_DBCLICK"] = "edge:dbclick";
    EventType["EDGE_MOUSEENTER"] = "edge:mouseenter";
    EventType["EDGE_MOUSELEAVE"] = "edge:mouseleave";
    EventType["EDGE_CONTEXTMENU"] = "edge:contextmenu";
    EventType["EDGE_ADJUST"] = "edge:adjust";
    EventType["EDGE_EXCHANGE_NODE"] = "edge:exchange-node";
    EventType["ANCHOR_DRAGSTART"] = "anchor:dragstart";
    EventType["ANCHOR_DRAG"] = "anchor:drag";
    EventType["ANCHOR_DROP"] = "anchor:drop";
    EventType["ANCHOR_DRAGEND"] = "anchor:dragend";
    EventType["BLANK_MOUSEDOWN"] = "blank:mousedown";
    EventType["BLANK_DRAGSTART"] = "blank:dragstart";
    EventType["BLANK_DRAG"] = "blank:drag";
    EventType["BLANK_DROP"] = "blank:drop";
    EventType["BLANK_MOUSEMOVE"] = "blank:mousemove";
    EventType["BLANK_MOUSEUP"] = "blank:mouseup";
    EventType["BLANK_CLICK"] = "blank:click";
    EventType["BLANK_CONTEXTMENU"] = "blank:contextmenu";
    EventType["SELECTION_MOUSEDOWN"] = "selection:mousedown";
    EventType["SELECTION_DRAGSTART"] = "selection:dragstart";
    EventType["SELECTION_DRAG"] = "selection:drag";
    EventType["SELECTION_DROP"] = "selection:drop";
    EventType["SELECTION_MOUSEMOVE"] = "selection:mousemove";
    EventType["SELECTION_MOUSEUP"] = "selection:mouseup";
    EventType["SELECTION_CONTEXTMENU"] = "selection:contextmenu";
    EventType["CONNECTION_NOT_ALLOWED"] = "connection:not-allowed";
    EventType["HISTORY_CHANGE"] = "history:change";
    EventType["TEXT_UPDATE"] = "text:update";
    EventType["GRAPH_TRANSFORM"] = "graph:transform";
    EventType["GRAPH_RENDERED"] = "graph:rendered";
})(EventType || (EventType = {}));
export var SegmentDirection;
(function (SegmentDirection) {
    SegmentDirection["HORIZONTAL"] = "horizontal";
    SegmentDirection["VERTICAL"] = "vertical";
})(SegmentDirection || (SegmentDirection = {}));
export var ElementMaxzIndex = 9999;
export var OverlapMode;
(function (OverlapMode) {
    OverlapMode[OverlapMode["DEFAULT"] = 0] = "DEFAULT";
    OverlapMode[OverlapMode["INCREASE"] = 1] = "INCREASE";
})(OverlapMode || (OverlapMode = {}));
