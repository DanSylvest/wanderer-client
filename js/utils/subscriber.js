/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/23/20.
 */

(function () {
    var moduleName = "utils/subscriber";

    var deps = [
        "env/promise",
        "env/tools/class",
        "env/tools/extend",
        "env/tools/emitter",

    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");
        var classCreator  = require("env/tools/class");
        var extend        = require("env/tools/extend");
        var Emitter       = require("env/tools/emitter");

        var Subscriber = classCreator("Subscriber", Emitter, {
            constructor: function (_options) {
                var base = extend({
                    dispatcher: null,
                    path: null,
                }, _options);

                Emitter.prototype.constructor.call(this);

                this._dispatcher = base.dispatcher;
                this._path = base.path;

                this._handlerId = -1;
            },
            _createHandler: function () {
                this._handlerId = this._dispatcher.add(this._eventHandler.bind(this));
            },
            subscribe: function () {
                this._subscribePormise = new CustomPromise();
                this._createHandler();
                this._dispatcher.send(this._handlerId, this._path, this._sendData());
                return this._subscribePormise.native;
            },
            unsubscribe: function () {
                // todo also we must send unsubscribe event
                var unsubscribePath = this._path.slice();
                unsubscribePath.push("unsubscribe");

                this._dispatcher.send(this._handlerId, unsubscribePath, this._sendData());

                this._dispatcher.remove(this._handlerId);
                this._handlerId = -1;
            },
            _eventHandler: function (_event) {
                // do nothing
            },
            _sendData: function () {
                return {

                }
            },
            notify: function (_data) {
                this._subscribePormise.resolve();
                this.emit("change", _data);
            }
        });

        return Subscriber;
    })
})();