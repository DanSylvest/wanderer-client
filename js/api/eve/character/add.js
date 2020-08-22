/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/eve/character/add";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var eveCharacterAdd = function (_code) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "character", "add"], {
                code: _code
            });

            return p.native;
        };

        return eveCharacterAdd;
    })
})();