/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/user/register";

    var deps = [
        "env/promise"

    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var registerUser = function (_type, _options) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e) : p.reject(_e.message);
            }.bind(this));

            if(_type === 0) {
                this.send(id, ["api", "user", "register"], {
                    type: _type,
                    mail: _options.mail,
                    password: _options.password,
                });
            } else if(_type === 1) {
                this.send(id, ["api", "user", "register"], {
                    type: _type,
                    code: _options.code
                });
            }

            return p.native;
        };

        return registerUser;
    })
})();