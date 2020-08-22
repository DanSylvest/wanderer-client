(function () {
    var moduleName = "api/eve/group/getAllowedCharactersForGroup";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var request = function (_groupId) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.list) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "group", "getAllowedCharactersForGroup"], {groupId: _groupId});

            return p.native;
        };

        return request;
    })
})();