/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/19/20.
 */

(function () {
    var moduleName = "api/eve/character/fastSearch";

    var deps = [
        "env/promise",
        "env/tools/exist",

    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");
        var exist         = require("env/tools/exist");

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
            if(!exist(_options.type)) throw "type is undefined";
            if(!exist(_options.match)) throw "match is undefined";

            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.result) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "character", "fastSearch"], {
                match: _options.match,
                type: _options.type
            });

            return p.native;
        };

        return request;
    })
})();