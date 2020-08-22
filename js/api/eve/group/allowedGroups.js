/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */



(function () {
    var moduleName = "api/eve/group/allowedGroups";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var request = function () {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.list) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "group", "allowedGroups"], {});

            return p.native;
        };

        return request;
    })
})();