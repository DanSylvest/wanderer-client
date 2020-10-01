/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 10/1/20.
 */

(function () {
    var moduleName = "api/eve/map/waypoint";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");

        /**
         *
         * @param _characterId
         * @param _type 0 - is set destination, 1 - add waypoint front, 2 - add waypoint back
         * @param _destinationSolarSystemId
         * @returns {*}
         */
        var request = function (_characterId, _type, _destinationSolarSystemId) {
            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.data) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "map", "waypoint"], {
                type: _type,
                characterId: _characterId,
                destinationSolarSystemId: _destinationSolarSystemId
            });

            return p.native;
        };

        return request;
    })
})();