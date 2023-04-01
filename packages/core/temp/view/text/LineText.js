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
import Text from '../basic-shape/Text';
import Rect from '../basic-shape/Rect';
import BaseText from './BaseText';
import { getBytesLength } from '../../util/edge';
import { getHtmlTextHeight, getSvgTextWidthHeight } from '../../util/node';
var LineText = /** @class */ (function (_super) {
    __extends(LineText, _super);
    function LineText(config) {
        var _this = _super.call(this, config) || this;
        _this.setHoverON = function () {
            _this.setState({
                isHoverd: true,
            });
        };
        _this.setHoverOFF = function () {
            _this.setState({
                isHoverd: false,
            });
        };
        _this.state = {
            isHoverd: false,
        };
        return _this;
    }
    LineText.prototype.getBackground = function () {
        var model = this.props.model;
        var style = model.getTextStyle();
        var text = model.text;
        var backgroundStyle = style.background || {};
        var isHoverd = this.state.isHoverd;
        if (isHoverd && style.hover && style.hover.background) {
            backgroundStyle = __assign(__assign({}, backgroundStyle), style.hover.background);
        }
        // 存在文本并且文本背景不为透明时计算背景框
        if (text && text.value && backgroundStyle.fill !== 'transparent') {
            var fontSize = style.fontSize, overflowMode = style.overflowMode, lineHeight = style.lineHeight, wrapPadding = style.wrapPadding, textWidth = style.textWidth;
            var value = text.value;
            var x = text.x, y = text.y;
            var rows = String(value).split(/[\r\n]/g);
            // 计算行数
            var rowsLength = rows.length;
            var rectAttr = void 0;
            if (overflowMode === 'autoWrap' && textWidth) {
                var textHeight = getHtmlTextHeight({
                    rows: rows,
                    style: {
                        fontSize: fontSize + "px",
                        width: textWidth + "px",
                        lineHeight: lineHeight,
                        padding: wrapPadding,
                    },
                    rowsLength: rowsLength,
                    className: 'lf-get-text-height',
                });
                rectAttr = __assign(__assign({}, backgroundStyle), { x: x - 1, y: y - 1, width: textWidth, height: textHeight });
            }
            else {
                // 计算文本中最长的一行的字节数
                var longestBytes_1 = 0;
                rows && rows.forEach(function (item) {
                    var rowByteLength = getBytesLength(item);
                    longestBytes_1 = rowByteLength > longestBytes_1 ? rowByteLength : longestBytes_1;
                });
                // 背景框宽度，最长一行字节数/2 * fontsize + 2
                // 背景框宽度， 行数 * fontsize + 2
                var _a = getSvgTextWidthHeight({ rows: rows, fontSize: fontSize, rowsLength: rowsLength }), width = _a.width, height = _a.height;
                // 根据设置的padding调整width, height, x, y的值
                if (typeof backgroundStyle.wrapPadding === 'string') {
                    var paddings = backgroundStyle.wrapPadding.split(',')
                        .filter(function (padding) { return padding.trim(); })
                        .map(function (padding) { return parseFloat(padding.trim()); });
                    if (paddings.length > 0 && paddings.length <= 4) {
                        if (paddings.length === 1) {
                            paddings = [paddings[0], paddings[0], paddings[0], paddings[0]];
                        }
                        else if (paddings.length === 2) {
                            paddings = [paddings[0], paddings[1], paddings[0], paddings[1]];
                        }
                        else if (paddings.length === 3) {
                            paddings = [paddings[0], paddings[1], paddings[2], paddings[1]];
                        }
                        width += paddings[1] + paddings[3];
                        height += paddings[0] + paddings[2];
                        x = x + (paddings[1] - paddings[3]) / 2;
                        y = y + (paddings[2] - paddings[0]) / 2;
                    }
                }
                rectAttr = __assign(__assign({}, backgroundStyle), { x: x - 1, y: y - 1, width: width,
                    height: height });
            }
            return h(Rect, __assign({}, rectAttr));
        }
    };
    LineText.prototype.getShape = function () {
        var model = this.props.model;
        var text = model.text;
        var value = text.value, x = text.x, y = text.y;
        if (!value)
            return;
        var style = model.getTextStyle();
        var attr = __assign({ x: x,
            y: y, className: 'lf-element-text', value: value }, style);
        return (h("g", { className: "lf-line-text", onMouseEnter: this.setHoverON, onMouseLeave: this.setHoverOFF },
            this.getBackground(),
            h(Text, __assign({}, attr, { model: model }))));
    };
    return LineText;
}(BaseText));
export default LineText;
