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
import { cloneDeep } from 'lodash-es';
import BaseEdgeModel from './BaseEdgeModel';
import { ModelType } from '../../constant/constant';
export { LineEdgeModel };
var LineEdgeModel = /** @class */ (function (_super) {
    __extends(LineEdgeModel, _super);
    function LineEdgeModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modelType = ModelType.LINE_EDGE;
        return _this;
    }
    LineEdgeModel.prototype.getEdgeStyle = function () {
        var line = this.graphModel.theme.line;
        var style = _super.prototype.getEdgeStyle.call(this);
        return __assign(__assign({}, style), cloneDeep(line));
    };
    LineEdgeModel.prototype.getTextPosition = function () {
        return {
            x: (this.startPoint.x + this.endPoint.x) / 2,
            y: (this.startPoint.y + this.endPoint.y) / 2,
        };
    };
    return LineEdgeModel;
}(BaseEdgeModel));
export default LineEdgeModel;
