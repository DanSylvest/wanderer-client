/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

(function () {
    var moduleName = "api/eve/corporation";

    var deps = [
        "api/eve/corporation/fastSearch",
        "api/eve/corporation/info",
    ];

    define(moduleName, deps, function () {
        return {
            fastSearch : require("api/eve/corporation/fastSearch"),
            info       : require("api/eve/corporation/info"),
        }
    });
})();