/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

(function () {
    var moduleName = "env/tabObserver";
    
    var deps = [
        "env/tools/class",
        "env/tools/emitter",
    ];
    
    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var Emitter = require("env/tools/emitter");

        var TabObserver = classCreator("TabObserver", Emitter, {
            constructor: function () {
                Emitter.prototype.constructor.call(this);
                this._handler = this._onChange.bind(this);

                document.addEventListener("visibilitychange", this._handler);
            },
            destructor: function () {
                window.removeEventListener("visibilitychange", this._handler);
                Emitter.prototype.destructor.call(this);
            },
            _onChange: function () {
                document.hidden ? this.emit("out") : this.emit("in");
            }
        });

        return TabObserver;
    })    
})();