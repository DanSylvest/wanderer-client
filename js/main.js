/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 4/9/20.
 */


var deps = [
    "env/tools/standardTypeExtend",
    "config",
    "api",
    "handlers",
    "env/tools/exist",
    "core/pageController",
    "core/pageExecutor",
    "core/componentController",
    "defaultLayout",
    "env/tabKeeper",
    "ui/vue/components/cAreaSelection",
];
require(deps, function() {
    var config         = require("config");
    var API            = require("api");
    var handlers       = require("handlers");
    var exist          = require("env/tools/exist");
    var PageController = require("core/pageController");
    var PageExecutor   = require("core/pageExecutor");
    var ComponentController   = require("core/componentController");

    window.api = new API({
        protocol: config.connection.socket.proto,
        host: config.connection.socket.host,
        port: config.connection.socket.port,
        handlers: handlers
    });

    api.init();

    api.on("ready", function () {
        window.pageExecutor = new PageExecutor();
        window.componentController = new ComponentController();

        window.pageController = new PageController({
            query: location.search
        });
        window.pageController.run().then(function(_data) {

            window.pageExecutor.execute(_data.page);
        }.bind(this));

    });
});

