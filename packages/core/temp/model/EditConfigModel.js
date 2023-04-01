var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { observable, action } from 'mobx';
import { assign, pick } from 'lodash-es';
var SilentConfig = {
    stopZoomGraph: false,
    stopScrollGraph: false,
    stopMoveGraph: false,
    adjustEdge: false,
    adjustEdgeStartAndEnd: false,
    adjustNodePosition: false,
    hideAnchors: true,
    nodeSelectedOutline: true,
    nodeTextEdit: false,
    edgeTextEdit: false,
    nodeTextDraggable: false,
    edgeTextDraggable: false,
};
var keys = [
    'isSilentMode',
    'stopZoomGraph',
    'stopScrollGraph',
    'stopMoveGraph',
    'adjustEdge',
    'adjustEdgeMiddle',
    'adjustEdgeStartAndEnd',
    'adjustNodePosition',
    'hideAnchors',
    'hoverOutline',
    'nodeSelectedOutline',
    'edgeSelectedOutline',
    'nodeTextEdit',
    'edgeTextEdit',
    'nodeTextDraggable',
    'edgeTextDraggable',
    'multipleSelectKey',
    'autoExpand',
];
/**
 * 页面编辑配置
 */
var EditConfigModel = /** @class */ (function () {
    function EditConfigModel(config) {
        this.isSilentMode = false;
        this.stopZoomGraph = false;
        this.stopScrollGraph = false;
        this.stopMoveGraph = false;
        this.adjustEdge = true;
        this.adjustEdgeMiddle = false;
        this.adjustEdgeStartAndEnd = false;
        this.adjustNodePosition = true;
        this.hideAnchors = false;
        this.hoverOutline = true;
        this.nodeSelectedOutline = true;
        this.edgeSelectedOutline = true;
        this.nodeTextEdit = true;
        this.edgeTextEdit = true;
        this.nodeTextDraggable = false;
        this.edgeTextDraggable = false;
        this.autoExpand = true;
        this.multipleSelectKey = '';
        this.defaultConfig = {}; // 设置为静默模式之前的配置，在取消静默模式后恢复
        assign(this, this.getConfigDetail(config));
    }
    EditConfigModel.prototype.updateEditConfig = function (config) {
        var newConfig = this.getConfigDetail(config);
        assign(this, newConfig);
    };
    EditConfigModel.prototype.getConfigDetail = function (config) {
        var isSilentMode = config.isSilentMode, textEdit = config.textEdit;
        var conf = {};
        // false表示从静默模式恢复
        if (isSilentMode === false) {
            assign(conf, this.defaultConfig);
        }
        // 如果不传，默认undefined表示非静默模式
        if (isSilentMode === true) {
            var silentConfig = pick(SilentConfig, keys);
            // 在修改之前，
            this.defaultConfig = {
                stopZoomGraph: this.stopZoomGraph,
                stopScrollGraph: this.stopScrollGraph,
                stopMoveGraph: this.stopMoveGraph,
                adjustEdge: this.adjustEdge,
                adjustEdgeMiddle: this.adjustEdgeMiddle,
                adjustEdgeStartAndEnd: this.adjustEdgeStartAndEnd,
                adjustNodePosition: this.adjustNodePosition,
                hideAnchors: this.hideAnchors,
                hoverOutline: this.hoverOutline,
                nodeSelectedOutline: this.nodeSelectedOutline,
                edgeSelectedOutline: this.edgeSelectedOutline,
                nodeTextEdit: this.nodeTextEdit,
                edgeTextEdit: this.edgeTextEdit,
                nodeTextDraggable: this.nodeTextDraggable,
                edgeTextDraggable: this.edgeTextDraggable,
                autoExpand: this.autoExpand,
            };
            assign(conf, silentConfig);
        }
        // 如果不传，默认undefined表示允许文本编辑
        if (textEdit === false) {
            assign(conf, {
                nodeTextEdit: false,
                edgeTextEdit: false,
            });
        }
        var userConfig = pick(config, keys);
        return assign(conf, userConfig);
    };
    EditConfigModel.prototype.getConfig = function () {
        return pick(this, keys);
    };
    __decorate([
        observable
    ], EditConfigModel.prototype, "isSilentMode", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "stopZoomGraph", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "stopScrollGraph", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "stopMoveGraph", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "adjustEdge", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "adjustEdgeMiddle", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "adjustEdgeStartAndEnd", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "adjustNodePosition", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "hideAnchors", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "hoverOutline", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "nodeSelectedOutline", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "edgeSelectedOutline", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "nodeTextEdit", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "edgeTextEdit", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "nodeTextDraggable", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "edgeTextDraggable", void 0);
    __decorate([
        observable
    ], EditConfigModel.prototype, "autoExpand", void 0);
    __decorate([
        action
    ], EditConfigModel.prototype, "updateEditConfig", null);
    return EditConfigModel;
}());
export default EditConfigModel;
export { EditConfigModel };
