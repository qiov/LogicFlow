var selected = null;
function translationNodeData(nodeData, distance) {
    nodeData.x += distance;
    nodeData.y += distance;
    if (nodeData.text) {
        nodeData.text.x += distance;
        nodeData.text.y += distance;
    }
    return nodeData;
}
function translationEdgeData(edgeData, distance) {
    if (edgeData.startPoint) {
        edgeData.startPoint.x += distance;
        edgeData.startPoint.y += distance;
    }
    if (edgeData.endPoint) {
        edgeData.endPoint.x += distance;
        edgeData.endPoint.y += distance;
    }
    if (edgeData.pointsList && edgeData.pointsList.length > 0) {
        edgeData.pointsList.forEach(function (point) {
            point.x += distance;
            point.y += distance;
        });
    }
    if (edgeData.text) {
        edgeData.text.x += distance;
        edgeData.text.y += distance;
    }
    return edgeData;
}
var TRANSLATION_DISTANCE = 40;
export function initDefaultShortcut(lf, graph) {
    var keyboard = lf.keyboard;
    var keyboardOptions = keyboard.options.keyboard;
    // 复制
    keyboard.on(['cmd + c', 'ctrl + c'], function () {
        if (!keyboardOptions.enabled)
            return;
        if (graph.textEditElement)
            return;
        var guards = lf.options.guards;
        var elements = graph.getSelectElements(false);
        var enabledClone = guards && guards.beforeClone ? guards.beforeClone(elements) : true;
        if (!enabledClone) {
            selected = null;
            return false;
        }
        selected = elements;
        selected.nodes.forEach(function (node) { return translationNodeData(node, TRANSLATION_DISTANCE); });
        selected.edges.forEach(function (edge) { return translationEdgeData(edge, TRANSLATION_DISTANCE); });
        return false;
    });
    // 粘贴
    keyboard.on(['cmd + v', 'ctrl + v'], function () {
        if (!keyboardOptions.enabled)
            return;
        if (graph.textEditElement)
            return;
        if (selected && (selected.nodes || selected.edges)) {
            lf.clearSelectElements();
            var addElements = lf.addElements(selected);
            if (!addElements)
                return;
            addElements.nodes.forEach(function (node) { return lf.selectElementById(node.id, true); });
            addElements.edges.forEach(function (edge) { return lf.selectElementById(edge.id, true); });
            selected.nodes.forEach(function (node) { return translationNodeData(node, TRANSLATION_DISTANCE); });
            selected.edges.forEach(function (edge) { return translationEdgeData(edge, TRANSLATION_DISTANCE); });
        }
        return false;
    });
    // undo
    keyboard.on(['cmd + z', 'ctrl + z'], function () {
        if (!keyboardOptions.enabled)
            return;
        if (graph.textEditElement)
            return;
        lf.undo();
        return false;
    });
    // redo
    keyboard.on(['cmd + y', 'ctrl + y'], function () {
        if (!keyboardOptions.enabled)
            return;
        if (graph.textEditElement)
            return;
        lf.redo();
        return false;
    });
    // delete
    keyboard.on(['backspace'], function () {
        if (!keyboardOptions.enabled)
            return;
        if (graph.textEditElement)
            return;
        var elements = graph.getSelectElements(true);
        lf.clearSelectElements();
        elements.edges.forEach(function (edge) { return lf.deleteEdge(edge.id); });
        elements.nodes.forEach(function (node) { return lf.deleteNode(node.id); });
        return false;
    });
}
