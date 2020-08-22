/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/component";

    var deps = [
        "api/component/load"
    ];

    define(moduleName, deps, function () {
        return {
            load: require("api/component/load")
        }
    });
})();