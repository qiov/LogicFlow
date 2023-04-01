export function snaplineTool(eventCenter, snaplineModel) {
    // 节点拖动时启动对齐线计算
    eventCenter.on('node:mousemove', function (_a) {
        var data = _a.data;
        snaplineModel.setNodeSnapLine(data);
    });
    // 节点拖动结束时，对齐线消失
    eventCenter.on('node:mouseup', function () {
        snaplineModel.clearSnapline();
    });
}
