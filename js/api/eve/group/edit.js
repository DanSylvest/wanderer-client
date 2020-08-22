/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/eve/group/edit";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");

        /**
         *
         * @param {string} _groupId
         * @param {Object} _options
         * @param {String} _options.name
         * @param {String} _options.description
         * @param {Array<number>} _options.characters
         * @param {Array<number>} _options.corporations
         * @param {Array<number>} _options.alliances
         * @param {Array<String>} _options.groups
         * @returns {*}
         */
        var request = function (_groupId, _options) {
            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "group", "edit"], {
                groupId: _groupId,
                name: _options.name,
                description: _options.description,
                characters: _options.characters,
                corporations: _options.corporations,
                alliances: _options.alliances,
                groups: _options.groups,
            });

            return p.native;
        };

        return request;
    })
})();