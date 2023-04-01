import { isArray } from 'lodash-es';
import Mousetrap from 'mousetrap';
var Keyboard = /** @class */ (function () {
    function Keyboard(options) {
        if (!options.keyboard) {
            options.keyboard = { enabled: false };
        }
        this.options = options;
        var lf = options.lf;
        this.target = lf.container;
        this.mousetrap = new Mousetrap(this.target);
        if (options.keyboard.enabled) {
            this.enable(true);
        }
    }
    Keyboard.prototype.initShortcuts = function () {
        var _this = this;
        var shortcuts = this.options.keyboard.shortcuts;
        if (shortcuts) {
            if (isArray(shortcuts)) {
                shortcuts.forEach(function (_a) {
                    var keys = _a.keys, callback = _a.callback, action = _a.action;
                    return _this.on(keys, callback, action);
                });
            }
            else {
                var keys = shortcuts.keys, callback = shortcuts.callback, action = shortcuts.action;
                this.on(keys, callback, action);
            }
        }
    };
    Keyboard.prototype.on = function (keys, callback, action) {
        this.mousetrap.bind(this.getKeys(keys), callback, action);
    };
    Object.defineProperty(Keyboard.prototype, "disabled", {
        get: function () {
            return this.options.keyboard.enabled !== true;
        },
        enumerable: true,
        configurable: true
    });
    Keyboard.prototype.off = function (keys, action) {
        this.mousetrap.unbind(this.getKeys(keys), action);
    };
    Keyboard.prototype.enable = function (force) {
        if (this.disabled || force) {
            this.options.keyboard.enabled = true;
            if (this.target instanceof HTMLElement) {
                this.target.setAttribute('tabindex', '-1');
                // 去掉节点被选中时container出现的边框
                this.target.style.outline = 'none';
            }
        }
    };
    Keyboard.prototype.disable = function () {
        if (!this.disabled) {
            this.options.keyboard.enabled = false;
            if (this.target instanceof HTMLElement) {
                this.target.removeAttribute('tabindex');
            }
        }
    };
    Keyboard.prototype.getKeys = function (keys) {
        var _this = this;
        return (Array.isArray(keys) ? keys : [keys]).map(function (key) { return _this.formatkey(key); });
    };
    Keyboard.prototype.formatkey = function (key) {
        var formated = key
            .toLowerCase()
            .replace(/\s/g, '')
            .replace('delete', 'del')
            .replace('cmd', 'command');
        return formated;
    };
    return Keyboard;
}());
export { Keyboard };
export default Keyboard;
