import TextEdit from './TextEditTool';
import MultipleSelect from './MultipleSelectTool';
var Tool = /** @class */ (function () {
    function Tool(instance) {
        this.toolMap = new Map();
        this.instance = instance;
        if (!this.isDisabledTool(TextEdit.toolName)) {
            this.registerTool(TextEdit.toolName, TextEdit);
        }
        if (!this.isDisabledTool(MultipleSelect.toolName)) {
            this.registerTool(MultipleSelect.toolName, MultipleSelect);
        }
    }
    Tool.prototype.isDisabledTool = function (toolName) {
        return this.instance.options.disabledTools.indexOf(toolName) !== -1;
    };
    Tool.prototype.registerTool = function (name, component) {
        this.toolMap.set(name, component);
    };
    Tool.prototype.getTools = function () {
        return Array.from(this.toolMap.values());
    };
    Tool.prototype.getInstance = function () {
        return this.instance;
    };
    return Tool;
}());
export default Tool;
