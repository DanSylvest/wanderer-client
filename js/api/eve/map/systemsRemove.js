/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */


(function () {
    var moduleName = "api/eve/map/systemsRemove";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");

        var request = function (_mapId, _systemIds) {
            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.data) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "map", "systemsRemove"], {
                mapId: _mapId,
                systemIds: _systemIds
            });

            return p.native;
        };

        return request;
    })
})();