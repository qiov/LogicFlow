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
import Circle from '../basic-shape/Circle';
import BaseNode from './BaseNode';
var CircleNode = /** @class */ (function (_super) {
    __extends(CircleNode, _super);
    function CircleNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CircleNode.prototype.getShape = function () {
        var model = this.props.model;
        var x = model.x, y = model.y, r = model.r;
        var style = model.getNodeStyle();
        return (h(Circle, __assign({}, style, { x: x, y: y, r: r })));
    };
    return CircleNode;
}(BaseNode));
export default CircleNode;
