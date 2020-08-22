/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */


(function () {
    var moduleName = "api/eve/map/systemRemove";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");

        var request = function (_mapId, _systemId) {
            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.data) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "map", "systemRemove"], {
                mapId: _mapId,
                systemId: _systemId
            });

            return p.native;
        };

        return request;
    })
})();