
(function () {
    var moduleName = "core/pageExecutor";

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "utils/log",
        "env/tools/emitter",
        "env/cookie",
        "env/tools/exist",
        "env/promise",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var extend       = require("env/tools/extend");
        var log          = require("utils/log");
        var Emitter      = require("env/tools/emitter");
        var cookie       = require("env/cookie");
        var exist        = require("env/tools/exist");
        var promise      = require("env/promise");

        var PageExecutor = classCreator("PageExecutor", Emitter, {
            constructor: function connector() {
                Emitter.prototype.constructor.call(this);
            },
            execute: function (_page, _force){
                if(_force) {
                    eval(_page);
                    return;
                }

                api.page.load(_page).then(function(_pageCode) {
                    // var code = atob(_pageCode);
                    eval(_pageCode/*atob(_pageCode)*/);
                    // debugger;
                }.bind(this),function() {
                    // вот этого вообще помоему быть не может
                    debugger;
                }.bind(this))
            }
        });

        return PageExecutor;
    })
})();