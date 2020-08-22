/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/eve/character/online";

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "utils/subscriber",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var extend       = require("env/tools/extend");
        var Subscriber   = require("utils/subscriber");

        var CharacterOnlineSubscriber = classCreator("CharacterOnlineSubscriber", Subscriber, {
            constructor: function (_options) {
                var base = extend({
                    /** @type string */
                    characterId: null,
                    path: ["api", "eve", "character", "online"]
                }, _options);

                Subscriber.prototype.constructor.call(this, base);

                this._characterId = base.characterId;
            },
            _sendData: function () {
                return {
                    characterId: this._characterId
                }
            },
            _eventHandler: function (_event) {
                this.notify(_event.data)
            },
        });

        var eveCharacterOnline = function (_characterId) {
            return new CharacterOnlineSubscriber({
                dispatcher: this,
                characterId: _characterId
            });
        };

        return eveCharacterOnline;
    })
})();

