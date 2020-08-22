/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

(function () {
    var moduleName = "api/eve/character";

    var deps = [
        "api/eve/character/add",
        "api/eve/character/list",
        "api/eve/character/online",
        "api/eve/character/fastSearch",
        "api/eve/character/charInfo",
        "api/eve/character/remove",
    ];

    define(moduleName, deps, function () {
        return {
            add        : require("api/eve/character/add"),
            list       : require("api/eve/character/list"),
            online     : require("api/eve/character/online"),
            fastSearch : require("api/eve/character/fastSearch"),
            charInfo   : require("api/eve/character/charInfo"),
            remove     : require("api/eve/character/remove"),
        }
    });
})();