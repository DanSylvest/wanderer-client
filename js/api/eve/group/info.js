/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */


(function () {
    var moduleName = "api/eve/group/info";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");

        var groupInfo = function (_groupId) {
            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.data) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "group", "info"], {
                groupId:_groupId
            });

            return p.native;
        };

        return groupInfo;
    })
})();