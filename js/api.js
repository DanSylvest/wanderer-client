/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 4/11/20.
 */

(function () {
    var moduleName = "api";

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "env/tools/emitter",
        "env/promise",
        "utils/log",
        "utils/dispatcher"
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var extend       = require("env/tools/extend");
        var Emitter      = require("env/tools/emitter");
        var promise      = require("env/promise");
        var log          = require("utils/log");
        var Dispatcher   = require("utils/dispatcher");

        var API = classCreator("API", Emitter, {
            constructor: function (_options) {
                this.options = extend({
                    protocol: null,
                    host: null,
                    port: null,
                    handlers: {}
                }, _options);

                this._status = "not_ready";
                
                Emitter.prototype.constructor.call(this);

                this._handlers = {};
            },
            init: function () {
                this.dispatcher = new Dispatcher({
                    protocol: this.options.protocol,
                    host: this.options.host,
                    port: this.options.port
                });

                this.dispatcher.on("ready", function() {
                    this._status = "ready";
                    this.emit("ready");
                }.bind(this));

                this._upgradeHandlers(this.options.handlers)
            },
            _upgradeHandlers: function (_handlers) {
                var recursive = function (_key, _node, _scope) {
                    switch (typeof _node) {
                        case "function":
                            _scope[_key] = _node.bind(this.dispatcher);
                            break;
                        case "object":
                            if (_key !== null)
                                _scope[_key] = {};

                            for (var k in _node) {
                                recursive(k, _node[k], _key !== null ? _scope[_key] : _scope);
                            }
                            break;
                    }
                }.bind(this);

                recursive(null, _handlers, this);

            },
            status: function () {
                return this._status;
            }
        });

        return API;
    })
})();