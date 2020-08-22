/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */



(function () {
    var moduleName = "api/eve/map/remove";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        /**
         *
         * @param {string} _mapId
         * @returns {*}
         */
        var eveMapRemove = function (_mapId) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "map", "remove"], {
                mapId: _mapId
            });

            return p.native;
        };

        return eveMapRemove;
    })
})();