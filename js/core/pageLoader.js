
(function () {
    var moduleName = "core/pageLoader";

    var deps = [
        "env/tools/class",
        "env/tools/emitter",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var Emitter = require("env/tools/emitter");

        var PageLoader = classCreator("PageLoader", Emitter, {
            constructor: function connector() {
                Emitter.prototype.constructor.call(this);
            },
            load: function (_page) {
                require([`ui/pages/${_page}`], function () {
                })
            }
        });

        return PageLoader;
    });
})();