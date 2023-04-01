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
import { h, Component } from 'preact';
var BackgroundOverlay = /** @class */ (function (_super) {
    __extends(BackgroundOverlay, _super);
    function BackgroundOverlay() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BackgroundOverlay.prototype.render = function () {
        var background = this.props.background;
        return (h("div", { className: "lf-background" },
            h("div", { style: background, className: "lf-background-area" })));
    };
    return BackgroundOverlay;
}(Component));
export default BackgroundOverlay;
