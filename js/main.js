/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 4/9/20.
 */


var deps = [
    "env/tools/standardTypeExtend",
    "conf/main",
    "api",
    "handlers",
    "env/tools/extend",
    "core/pageController",
    "core/pageLoader",
    "defaultLayout",
    // "env/tabKeeper"
];
require(deps, function() {
    var mainConf       = require("conf/main");
    var API            = require("api");
    var handlers       = require("handlers");
    var extend         = require("env/tools/extend");
    var PageController = require("core/pageController");
    var PageLoader     = require("core/pageLoader");

    require(["conf/custom"], function (customConf) {
        extend(mainConf, customConf);
        initialize();
    }, function () {
        initialize();
    });

    var initialize = function () {
        window.config = mainConf;

        window.api = new API({
            protocol: config.connection.socket.proto,
            host: config.connection.socket.host,
            port: config.connection.socket.port,
            handlers: handlers
        });

        api.init();

        api.on("ready", function () {
            pageExecutor = new PageLoader();

            pageController = new PageController({
                query: location.search
            });
            pageController.run().then(function(_data) {
                pageExecutor.load(_data.page);
            }.bind(this));

        });

        document.title = config.app.title;
    };
});

