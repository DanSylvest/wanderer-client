/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

(function () {
    var moduleName = "api/eve/alliance";

    var deps = [
        "api/eve/alliance/fastSearch",
        "api/eve/alliance/info",
    ];

    define(moduleName, deps, function () {
        return {
            fastSearch : require("api/eve/alliance/fastSearch"),
            info       : require("api/eve/alliance/info"),
        }
    });
})();