
(function () {
    var moduleName = "api/eve/map/updateLink";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");

        var request = function (_mapId, _linkId, _data) {
            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.data) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "map", "updateLink"], {
                mapId: _mapId,
                linkId: _linkId,
                data: _data
            });

            return p.native;
        };

        return request;
    })
})();