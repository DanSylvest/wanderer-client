/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/page";

    var deps = [
        "api/page/isProtect",
        "api/page/load"
    ];

    define(moduleName, deps, function () {
        return {
            isProtect:  require("api/page/isProtect"),
            load:       require("api/page/load")
        }
    });
})();