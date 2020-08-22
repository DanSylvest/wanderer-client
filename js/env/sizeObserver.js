/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

(function () {
    var moduleName = "env/sizeObserver";
    
    var deps = [
        "env/tools/class"
    ];
    
    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");

        var SizeObserver = classCreator("SizeObserver", null, {
            constructor: function (_handler) {
                this._handler = _handler;
                window.addEventListener("resize", this._handler);
            },
            destructor: function () {
                window.removeEventListener("resize", this._handler);
            }
        });

        return SizeObserver;
    })    
})();