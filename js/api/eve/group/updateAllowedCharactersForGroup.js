(function () {
    var moduleName = "api/eve/group/updateAllowedCharactersForGroup";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var request = function (_groupId, _characters) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve() : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "group", "updateAllowedCharactersForGroup"], {
                groupId: _groupId,
                characters: _characters
            });

            return p.native;
        };

        return request;
    })
})();