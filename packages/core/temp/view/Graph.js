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
import { Component, h } from 'preact';
import { map } from 'lodash-es';
import CanvasOverlay from './overlay/CanvasOverlay';
import ToolOverlay from './overlay/ToolOverlay';
import BackgroundOverlay from './overlay/BackgroundOverlay';
import Grid from './overlay/Grid';
import SnaplineOverlay from './overlay/SnaplineOverlay';
import OutlineOverlay from './overlay/OutlineOverlay';
import BezierAdjustOverlay from './overlay/BezierAdjustOverlay';
import { observer } from '..';
import ModificationOverlay from './overlay/ModificationOverlay';
// todo: fixme type
// @ts-ignore
var Graph = /** @class */ (function (_super) {
    __extends(Graph, _super);
    function Graph() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // get InjectedProps() {
    //   return this.props as InjectedProps;
    // }
    Graph.prototype.getComponent = function (model, graphModel, overlay) {
        if (overlay === void 0) { overlay = 'canvas-overlay'; }
        var getView = this.props.getView;
        var View = getView(model.type);
        return (h(View, { key: model.id, model: model, graphModel: graphModel, overlay: overlay }));
    };
    Graph.prototype.render = function () {
        var _this = this;
        var _a = this.props, graphModel = _a.graphModel, tool = _a.tool, options = _a.options, dnd = _a.dnd, snaplineModel = _a.snaplineModel;
        var style = {};
        // 如果初始化的时候，不传宽高，则默认为父容器宽高。
        if (options.width) {
            style.width = graphModel.width + "px";
        }
        if (options.height) {
            style.height = graphModel.height + "px";
        }
        var fakerNode = graphModel.fakerNode, editConfigModel = graphModel.editConfigModel;
        var adjustEdge = editConfigModel.adjustEdge;
        return (h("div", { className: "lf-graph", style: style },
            h(CanvasOverlay, { graphModel: graphModel, dnd: dnd },
                h("g", { className: "lf-base" }, map(graphModel.sortElements, function (nodeModel) { return (_this.getComponent(nodeModel, graphModel)); })),
                fakerNode ? this.getComponent(fakerNode, graphModel) : ''),
            h(ModificationOverlay, { graphModel: graphModel },
                h(OutlineOverlay, { graphModel: graphModel }),
                adjustEdge ? h(BezierAdjustOverlay, { graphModel: graphModel }) : '',
                !options.isSilentMode && options.snapline !== false ? h(SnaplineOverlay, { snaplineModel: snaplineModel }) : ''),
            h(ToolOverlay, { graphModel: graphModel, tool: tool }),
            options.background && h(BackgroundOverlay, { background: options.background }),
            options.grid && h(Grid, __assign({}, options.grid, { graphModel: graphModel }))));
    };
    Graph = __decorate([
        observer
    ], Graph);
    return Graph;
}(Component));
export default Graph;
