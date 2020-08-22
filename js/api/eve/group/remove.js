/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */



(function () {
    var moduleName = "api/eve/group/remove";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        /**
         *
         * @param {string} _groupId
         * @returns {*}
         */
        var request = function (_groupId) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "group", "remove"], {
                groupId: _groupId
            });

            return p.native;
        };

        return request;
    })
})();