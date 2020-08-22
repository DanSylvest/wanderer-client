/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/19/20.
 */

(function () {
    var moduleName = "api/eve/group/fastSearch";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");

        /**
         *
         * @param {string} _mapId
         * @param {Object} _options
         * @param {String} _options.name
         * @param {String} _options.description
         * @param {Boolean} _options.isPrivate
         * @param {Array<String>} _options.groups
         * @returns {*}
         */
        var request = function (_options) {
            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "group", "fastSearch"], {
                match: _options.match,
                type: _options.type
            });

            return p.native;
        };

        return request;
    })
})();