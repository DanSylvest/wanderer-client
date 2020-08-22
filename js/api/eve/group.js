/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

(function () {
    var moduleName = "api/eve/group";

    var deps = [
        "api/eve/group/add",
        "api/eve/group/list",
        "api/eve/group/info",
        "api/eve/group/fastSearch",
        "api/eve/group/remove",
        "api/eve/group/edit",
        "api/eve/group/allowedGroups",
        "api/eve/group/getAllowedCharactersForGroup",
        "api/eve/group/updateAllowedCharactersForGroup",
    ];

    define(moduleName, deps, function () {
        return {
            add                             : require("api/eve/group/add"),
            list                            : require("api/eve/group/list"),
            info                            : require("api/eve/group/info"),
            fastSearch                      : require("api/eve/group/fastSearch"),
            remove                          : require("api/eve/group/remove"),
            edit                            : require("api/eve/group/edit"),
            allowedGroups                   : require("api/eve/group/allowedGroups"),
            getAllowedCharactersForGroup    : require("api/eve/group/getAllowedCharactersForGroup"),
            updateAllowedCharactersForGroup : require("api/eve/group/updateAllowedCharactersForGroup"),
        }
    });
})();