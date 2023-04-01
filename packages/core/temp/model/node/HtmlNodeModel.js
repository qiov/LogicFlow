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
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
var HtmlNodeModel = /** @class */ (function (_super) {
    __extends(HtmlNodeModel, _super);
    function HtmlNodeModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modelType = ModelType.HTML_NODE;
        return _this;
    }
    HtmlNodeModel.prototype.getDefaultAnchor = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        return [
            { x: x, y: y - height / 2, id: this.id + "_0" },
            { x: x + width / 2, y: y, id: this.id + "_1" },
            { x: x, y: y + height / 2, id: this.id + "_2" },
            { x: x - width / 2, y: y, id: this.id + "_3" },
        ];
    };
    return HtmlNodeModel;
}(BaseNodeModel));
export { HtmlNodeModel };
export default HtmlNodeModel;
