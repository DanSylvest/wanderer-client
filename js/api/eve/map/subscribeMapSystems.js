/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/eve/map/subscribeMapSystems";

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "utils/subscriber",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var extend       = require("env/tools/extend");
        var Subscriber   = require("utils/subscriber");

        var MapSystemsSubscriber = classCreator("MapSystemsSubscriber", Subscriber, {
            constructor: function (_options) {
                var base = extend({
                    /** @type string */
                    characterId: null,
                    path: ["api", "eve", "map", "subscribeMapSystems"]
                }, _options);

                Subscriber.prototype.constructor.call(this, base);

                this._mapId = base.mapId;
            },
            _sendData: function () {
                return {
                    mapId: this._mapId
                }
            },
            _eventHandler: function (_event) {
                this.notify(_event.data)
            },
        });

        var subscriber = function (_mapId) {
            return new MapSystemsSubscriber({
                dispatcher: this,
                mapId: _mapId
            });
        };

        return subscriber;
    })
})();

