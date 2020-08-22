/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/user/login";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var loginUser = function (_mail, _password) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.token) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "user", "login"], {
                mail: _mail,
                password: _password,
            });

            return p.native;
        };

        return loginUser;
    })
})();