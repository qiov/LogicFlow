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
import Rect from '../basic-shape/Rect';
import BaseNode from './BaseNode';
var TextNode = /** @class */ (function (_super) {
    __extends(TextNode, _super);
    function TextNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextNode.prototype.getBackground = function () {
        var model = this.props.model;
        var style = model.getTextStyle();
        var text = model.text;
        if (text && text.value && style.background && style.background.fill !== 'transparnet') {
            var x = text.x, y = text.y;
            // 背景框宽度，最长一行字节数/2 * fontsize + 2
            // 背景框宽度， 行数 * fontsize + 2
            var width = model.width, height = model.height;
            var rectAttr = __assign(__assign({}, style.background), { x: x, y: y - 1, width: width,
                height: height });
            return h(Rect, __assign({}, rectAttr));
        }
    };
    TextNode.prototype.getShape = function () {
        return (h("g", null, this.getBackground()));
    };
    return TextNode;
}(BaseNode));
export default TextNode;
