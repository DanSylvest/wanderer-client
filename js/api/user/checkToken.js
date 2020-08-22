/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/user/checkToken";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var checkUserToken = function (_token) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve() : p.reject();
            }.bind(this));

            this.send(id, ["api", "user", "checkToken"], {token: _token});

            return p.native;
        };

        return checkUserToken;
    })
})();