/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

(function () {
    var moduleName = "api/eve";

    var deps = [
        "api/eve/character",
        "api/eve/corporation",
        "api/eve/alliance",
        "api/eve/map",
        "api/eve/group"
    ];

    define(moduleName, deps, function () {
        return {
            character   : require("api/eve/character"),
            corporation : require("api/eve/corporation"),
            alliance    : require("api/eve/alliance"),
            map         : require("api/eve/map"),
            group       : require("api/eve/group")
        }
    });
})();