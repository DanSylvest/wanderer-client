/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/20/20.
 */

(function () {
    var moduleName = "api/eve/alliance/info";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        /**
         *
         * @param _allianceId
         * @param {string} _type - may be "local", or "global" - when local info will be get by added character
         * default "global"
         * @returns {*}
         */
        var request = function (_allianceId, _type) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.result) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "alliance", "info"], {
                allianceId: _allianceId,
                type: _type || "global"
            });

            return p.native;
        };

        return request;
    })
})();