/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/user";

    var deps = [
        "api/user/checkToken",
        "api/user/login",
        "api/user/register",
    ];

    define(moduleName, deps, function () {
        return {
            checkToken:       require("api/user/checkToken"),
            login:            require("api/user/login"),
            register:         require("api/user/register"),
        }
    });
})();