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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { h, Component } from 'preact';
import { observer } from '../..';
var ToolOverlay = /** @class */ (function (_super) {
    __extends(ToolOverlay, _super);
    function ToolOverlay() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.setToolOverlayRef = function (element) {
            var tool = _this.props.tool;
            var lf = tool.getInstance();
            lf.components.forEach(function (render) { return render(lf, element); });
            lf.components = []; // 保证extension组件的render只执行一次
        };
        return _this;
    }
    /**
     * 外部传入的一般是HTMLElement
     */
    ToolOverlay.prototype.getTools = function () {
        var _a = this.props, tool = _a.tool, graphModel = _a.graphModel;
        var tools = tool.getTools();
        var components = tools.map(function (item) { return h(item, {
            graphModel: graphModel,
            logicFlow: tool.instance,
        }); });
        tool.components = components;
        return components;
    };
    ToolOverlay.prototype.render = function () {
        return (h("div", { className: "lf-tool-overlay", ref: this.setToolOverlayRef }, this.getTools()));
    };
    ToolOverlay = __decorate([
        observer
    ], ToolOverlay);
    return ToolOverlay;
}(Component));
export default ToolOverlay;
