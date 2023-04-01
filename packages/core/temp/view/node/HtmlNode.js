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
import { h } from 'preact';
import BaseNode from './BaseNode';
var HtmlNode = /** @class */ (function (_super) {
    __extends(HtmlNode, _super);
    function HtmlNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.setRef = function (dom) {
            _this.ref = dom;
        };
        return _this;
    }
    Object.defineProperty(HtmlNode.prototype, "rootEl", {
        get: function () {
            return this.ref;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @overridable 支持重写
     * 自定义HTML节点内容
     * @param {HTMLElement} rootEl 自定义HTML节点内容可以挂载的dom节点
     * @example
     * class CustomHtmlNode extends HtmlNode {
     *   setHtml(rootEl) {
     *     const input = document.createElement('input');
     *     rootEl.appendChild(input)
     *   }
     * }
     */
    HtmlNode.prototype.setHtml = function (rootEl) {
        rootEl.appendChild(document.createElement('div'));
    };
    /**
     * @overridable 支持重写
     * 和react的shouldComponentUpdate类似，都是为了避免出发不必要的render.
     * 但是这里不一样的地方在于，setHtml方法，我们只在properties发生变化了后再触发。
     * 而x,y等这些坐标相关的方法发生了变化，不会再重新触发setHtml.
     */
    HtmlNode.prototype.shouldUpdate = function () {
        if (this.preProperties && this.preProperties === this.currentProperties)
            return;
        this.preProperties = this.currentProperties;
        return true;
    };
    HtmlNode.prototype.componentDidMount = function () {
        if (this.shouldUpdate()) {
            this.setHtml(this.rootEl);
        }
    };
    HtmlNode.prototype.componentDidUpdate = function () {
        if (this.shouldUpdate()) {
            this.setHtml(this.rootEl);
        }
    };
    HtmlNode.prototype.getShape = function () {
        var model = this.props.model;
        var x = model.x, y = model.y, height = model.height, width = model.width;
        var style = model.getNodeStyle();
        this.currentProperties = JSON.stringify(model.properties);
        return (h("foreignObject", __assign({}, style, { x: x - width / 2, y: y - height / 2, width: width, height: height, ref: this.setRef })));
    };
    return HtmlNode;
}(BaseNode));
export default HtmlNode;
