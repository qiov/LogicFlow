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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { h } from 'preact';
import { ElementType, ModelType } from '../../constant/constant';
import { getHtmlTextHeight } from '../../util/node';
export default function Text(props) {
    var _a = props.x, x = _a === void 0 ? 0 : _a, _b = props.y, y = _b === void 0 ? 0 : _b, value = props.value, fontSize = props.fontSize, _c = props.fill, fill = _c === void 0 ? 'currentColor' : _c, _d = props.overflowMode, overflowMode = _d === void 0 ? 'default' : _d, _e = props.textWidth, textWidth = _e === void 0 ? '' : _e, model = props.model;
    var attrs = {
        textAnchor: 'middle',
        'dominant-baseline': 'middle',
        x: x,
        y: y,
        fill: fill,
    };
    Object.entries(props).forEach(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        var valueType = typeof v;
        if (valueType !== 'object') {
            attrs[k] = v;
        }
    });
    if (value) {
        // String(value),兼容纯数字的文案
        var rows = String(value).split(/[\r\n]/g);
        var rowsLength_1 = rows.length;
        if (overflowMode !== 'default') {
            // 非文本节点设置了自动换行，或边设置了自动换行并且设置了textWidth
            var BaseType = model.BaseType, modelType = model.modelType;
            if ((BaseType === ElementType.NODE && modelType !== ModelType.TEXT_NODE)
                || (BaseType === ElementType.EDGE && textWidth)) {
                return renderHtmlText(props);
            }
        }
        if (rowsLength_1 > 1) {
            var tspans = rows.map((function (row, i) {
                // 保证文字居中，文字Y轴偏移为当前行数对应中心行数的偏移行 * 行高
                var tspanLineHeight = fontSize + 2;
                var offsetY = (i - (rowsLength_1 - 1) / 2) * tspanLineHeight;
                return (h("tspan", { className: "lf-text-tspan", x: x, y: y + offsetY }, row));
            }));
            return (h("text", __assign({}, attrs), tspans));
        }
        return (h("text", __assign({}, attrs), value));
    }
}
function renderHtmlText(props) {
    var value = props.value, fontSize = props.fontSize, model = props.model, _a = props.fontFamily, fontFamily = _a === void 0 ? '' : _a, lineHeight = props.lineHeight, _b = props.wrapPadding, wrapPadding = _b === void 0 ? '0, 0' : _b, overflowMode = props.overflowMode, x = props.x, y = props.y;
    var width = model.width, textHeight = model.textHeight;
    var textRealWidth = props.textWidth || width;
    var rows = String(value).split(/[\r\n]/g);
    var rowsLength = rows.length;
    var textRealHeight = getHtmlTextHeight({
        rows: rows,
        style: {
            fontSize: fontSize + "px",
            width: textRealWidth + "px",
            fontFamily: fontFamily,
            lineHeight: lineHeight,
            padding: wrapPadding,
        },
        rowsLength: rowsLength,
        className: 'lf-get-text-height',
    });
    // 当文字超过边框时，取文字高度的实际值，也就是文字可以超过边框
    var foreignObjectHeight = model.height > textRealHeight ? model.height : textRealHeight;
    // 如果设置了文字高度，取设置的高度
    if (textHeight) {
        foreignObjectHeight = textHeight;
    }
    var isEllipsis = overflowMode === 'ellipsis';
    return (h("g", null,
        h("foreignObject", { width: textRealWidth, height: foreignObjectHeight, x: x - textRealWidth / 2, y: y - foreignObjectHeight / 2 },
            h("div", { className: "lf-node-text-auto-wrap", style: {
                    minHeight: foreignObjectHeight,
                    width: textRealWidth,
                    padding: wrapPadding,
                } },
                h("div", { className: isEllipsis ? 'lf-node-text-ellipsis-content' : 'lf-node-text-auto-wrap-content', style: __assign({}, props) }, rows.map(function (item) { return h("div", { className: "lf-node-text--auto-wrap-inner" }, item); }))))));
}
