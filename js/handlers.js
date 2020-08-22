/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "handlers";

    var deps = [
        "api/component",
        "api/page",
        "api/eve",
        "api/user"
    ];

    define(moduleName, deps, function () {
        return {
            component : require("api/component"),
            page      : require("api/page"),
            eve       : require("api/eve"),
            user      : require("api/user")
        }
    });
})();