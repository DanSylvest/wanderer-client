/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/17/20.
 */


(function () {
    var moduleName = "core/componentController";

    var deps = [
        "env/tools/class",
        // "env/tools/extend",
        // "utils/log",
        "env/tools/emitter",
        // "env/cookie",
        // "env/tools/exist",
        "env/promise",
        // "env/tools/path",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        // var extend = require("env/tools/extend");
        // var log = require("utils/log");
        var Emitter = require("env/tools/emitter");
        // var cookie = require("env/cookie");
        // var exist = require("env/tools/exist");
        var promise = require("env/promise");
        // var Path = require("env/tools/path");

        var ComponentController = classCreator("ComponentController", Emitter, {
            constructor: function connector() {
                Emitter.prototype.constructor.call(this);
            },
            load: function (_name) {
                var pr = new promise();

                window.api.component.load(_name).then(function (_event) {
                    window.pageExecutor.execute(_event.code, true);
                    require([_event.path], function (a, b, c) {
                        if(a) // maybe it is error?
                            debugger;

                        pr.resolve();
                    });
                }.bind(this), function (_err) {
                    pr.reject(_err);
                }.bind(this));

                return pr.native;
            }
        });

        return ComponentController;
    })
})();