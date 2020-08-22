/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 4/11/20.
 */

(function () {
    var moduleName = "utils/dispatcher";

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "env/tools/emitter",
        "utils/log",
        "utils/connector",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var extend       = require("env/tools/extend");
        var Emitter      = require("env/tools/emitter");
        var log          = require("utils/log");
        var Connector    = require("utils/connector");

        var counter = 0;
        var Dispatcher = classCreator("Dispatcher", Emitter, {
            constructor: function dispatcher(_options) {
                var base = extend({
                    protocol: null,
                    host: null,
                    port: null
                }, _options);

                this._connector = null;
                this._subscribers = Object.create(null);

                Emitter.prototype.constructor.call(this);

                this._protocol = base.protocol;
                this._host = base.host;
                this._port = base.port;

                this.start_connector();
            },
            start_connector: function () {
                this._connector = new Connector({
                    protocol: this._protocol,
                    host: this._host,
                    port: this._port
                });
                this._connector.on("data", this._on_data.bind(this));
                this._connector.on("closed", this._on_closed.bind(this));
            },
            _on_data: function (_event) {
                if (_event.eventType === "newConnection") {
                    log(log.INFO, "Client Ready");
                    this.emit("ready", _event);
                } else {
                    var info = this._subscribers[_event.responseId];
                    if (info) {
                        info.callback(_event);
                    } else {
                        log(log.WARN, "Default event handler (%s)", _event.route.join("."));
                    }
                }
            },
            _on_closed: function (_data) {
                log(log.INFO, "Socket closed");
                this.emit("closed", _data);
            },
            add: function (_callback) {
                var id = counter++;
                this._subscribers[id] = new _data(null, _callback);
                return id;
            },
            remove: function (_sid) {
                delete this._subscribers[_sid];
            },
            send: function (_responseId, _route, _data) {
                this._connector.send({
                    responseId: _responseId,
                    route: _route,
                    data: _data
                });
            }
        });

        var _data = function _data(_data, _callback) {
            this.data = _data;
            this.callback = _callback;
        };

        return Dispatcher;
    })
})();