
(function () {
    var moduleName = "api/eve/map/updateSystemsPosition";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");

        var request = function (_mapId, _systemsPosition) {
            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.data) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "map", "updateSystemsPosition"], {
                mapId: _mapId,
                systemsPosition: _systemsPosition
            });

            return p.native;
        };

        return request;
    })
})();