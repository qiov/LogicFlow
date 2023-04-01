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
import Polygon from '../basic-shape/Polygon';
var DiamondNode = /** @class */ (function (_super) {
    __extends(DiamondNode, _super);
    function DiamondNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DiamondNode.prototype.getShape = function () {
        var model = this.props.model;
        var style = model.getNodeStyle();
        return (h("g", null,
            h(Polygon, __assign({}, style, { points: model.points, x: model.x, y: model.y }))));
    };
    return DiamondNode;
}(BaseNode));
export default DiamondNode;
