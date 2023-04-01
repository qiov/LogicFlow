var WILDCARD = '*';
export { EventEmitter };
/* event-emitter */
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this._events = {};
    }
    /**
       * 监听一个事件
       * @param evt 事件名称
       * @param callback
       * @param once
       */
    EventEmitter.prototype.on = function (evt, callback, once) {
        var _this = this;
        evt === null || evt === void 0 ? void 0 : evt.split(',').forEach(function (evKey) {
            evKey = evKey.trim();
            if (!_this._events[evKey]) {
                _this._events[evKey] = [];
            }
            _this._events[evKey].push({
                callback: callback,
                once: !!once,
            });
        });
        return this;
    };
    /**
     * 监听一个事件一次
     * @param evt
     * @param callback
     */
    EventEmitter.prototype.once = function (evt, callback) {
        var _this = this;
        evt === null || evt === void 0 ? void 0 : evt.split(',').forEach(function (evKey) {
            evKey = evKey.trim();
            return _this.on(evKey, callback, true);
        });
    };
    /**
       * 触发一个事件
       * @param evt
       * @param args
       */
    EventEmitter.prototype.emit = function (evts, eventArgs) {
        var _this = this;
        evts === null || evts === void 0 ? void 0 : evts.split(',').forEach(function (evt) {
            var events = _this._events[evt] || [];
            var wildcardEvents = _this._events[WILDCARD] || [];
            // 实际的处理 emit 方法
            var doEmit = function (es) {
                var length = es.length;
                for (var i = 0; i < length; i++) {
                    if (!es[i]) {
                        // eslint-disable-next-line no-continue
                        continue;
                    }
                    var _a = es[i], callback = _a.callback, once = _a.once;
                    if (once) {
                        es.splice(i, 1);
                        if (es.length === 0) {
                            delete _this._events[evt];
                        }
                        length--;
                        i--;
                    }
                    callback.apply(_this, [eventArgs]);
                }
            };
            doEmit(events);
            doEmit(wildcardEvents);
        });
    };
    /**
       * 取消监听一个事件，或者一个channel
       * @param evt
       * @param callback
       */
    EventEmitter.prototype.off = function (evts, callback) {
        var _this = this;
        if (!evts) {
            // evt 为空全部清除
            this._events = {};
        }
        evts.split(',').forEach(function (evt) {
            if (!callback) {
                // evt 存在，callback 为空，清除事件所有方法
                delete _this._events[evt];
            }
            else {
                // evt 存在，callback 存在，清除匹配的
                var events = _this._events[evt] || [];
                var length_1 = events.length;
                for (var i = 0; i < length_1; i++) {
                    if (events[i].callback === callback) {
                        events.splice(i, 1);
                        length_1--;
                        i--;
                    }
                }
                if (events.length === 0) {
                    delete _this._events[evt];
                }
            }
        });
        return this;
    };
    /* 当前所有的事件 */
    EventEmitter.prototype.getEvents = function () {
        return this._events;
    };
    return EventEmitter;
}());
export default EventEmitter;
