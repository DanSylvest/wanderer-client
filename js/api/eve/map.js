/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

(function () {
    var moduleName = "api/eve/map";

    var deps = [
        "api/eve/map/add",
        "api/eve/map/edit",
        "api/eve/map/list",
        "api/eve/map/remove",
        "api/eve/map/allowedMaps",
        "api/eve/map/info",
        "api/eve/map/subscribeMapSystems",
        "api/eve/map/subscribeMapLinks",
        "api/eve/map/systemInfo",
        "api/eve/map/linkInfo",
        "api/eve/map/linkRemove",
        "api/eve/map/systemRemove",
        "api/eve/map/systemsRemove",
        "api/eve/map/updateSystemsPosition",
        "api/eve/map/updateSystem",
        "api/eve/map/updateLink",
    ];

    define(moduleName, deps, function () {
        return {
            add                   : require("api/eve/map/add"),
            edit                  : require("api/eve/map/edit"),
            remove                : require("api/eve/map/remove"),
            list                  : require("api/eve/map/list"),
            allowedMaps           : require("api/eve/map/allowedMaps"),
            info                  : require("api/eve/map/info"),
            subscribeMapSystems   : require("api/eve/map/subscribeMapSystems"),
            subscribeMapLinks     : require("api/eve/map/subscribeMapLinks"),
            systemInfo            : require("api/eve/map/systemInfo"),
            linkInfo              : require("api/eve/map/linkInfo"),
            linkRemove            : require("api/eve/map/linkRemove"),
            systemRemove          : require("api/eve/map/systemRemove"),
            systemsRemove         : require("api/eve/map/systemsRemove"),
            updateSystemsPosition : require("api/eve/map/updateSystemsPosition"),
            updateSystem          : require("api/eve/map/updateSystem"),
            updateLink            : require("api/eve/map/updateLink"),
        }
    });
})();