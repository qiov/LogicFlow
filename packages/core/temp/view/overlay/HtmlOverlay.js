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
/**
 * HtmlOverlay和CanvasOverlay放大，缩小，平移保持一致。
 * 但是这里是放的是HTML标签而不是SVG。
 * 目前这里可以放文本。
 * 之后可以考虑放图片，范围框等。
 */
import { h, Component } from 'preact';
// import getTransform from './getTransformHoc';
// import { GraphTransform } from '../../type';
import { observer } from '../..';
// type InjectedProps = IProps & {
//   transformStyle: GraphTransform
// };
var HtmlOverlay = /** @class */ (function (_super) {
    __extends(HtmlOverlay, _super);
    function HtmlOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // get InjectedProps() {
    //   return this.props as InjectedProps;
    // }
    HtmlOverlay.prototype.render = function () {
        var transformModel = this.props.graphModel.transformModel;
        var transform = transformModel.getTransformStyle().transform;
        var children = this.props.children;
        return (h("div", { className: "lf-html-overlay" },
            h("div", { className: "lf-html-overlay__transform", style: transform }, children)));
    };
    HtmlOverlay = __decorate([
        observer
    ], HtmlOverlay);
    return HtmlOverlay;
}(Component));
export default HtmlOverlay;
