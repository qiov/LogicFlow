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
// TODO: 默认样式引入
export default function Rect(props) {
    var x = props.x, y = props.y, width = props.width, height = props.height, className = props.className, radius = props.radius;
    var leftTopX = x - width / 2;
    var leftTopY = y - height / 2;
    var attrs = {};
    Object.entries(props).forEach(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        var valueType = typeof v;
        if (valueType !== 'object') {
            attrs[k] = v;
        }
    });
    if (className) {
        attrs.className = "lf-basic-shape " + className;
    }
    else {
        attrs.className = 'lf-basic-shape';
    }
    if (radius) {
        attrs.rx = radius;
        attrs.ry = radius;
    }
    attrs.x = leftTopX;
    attrs.y = leftTopY;
    return (h("rect", __assign({}, attrs)));
}
Rect.defaultProps = {
    className: '',
    radius: '',
};
