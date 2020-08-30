/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 8/30/20.
 */

(function () {
    var moduleName = "env/mouseObserver";

    var deps = [
        "env/tools/class",
        "env/tools/emitter",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var Emitter      = require("env/tools/emitter");

        var MouseObserver = classCreator("MouseObserver", Emitter, {
            constructor: function (_element) {
                Emitter.prototype.constructor.call(this);

                this.element = _element;
                this._isInside = false;
                this._handlerMouseMove = this._onMouseMove.bind(this);

                window.addEventListener("mousemove", this._handlerMouseMove);
            },
            destructor: function () {
                window.removeEventListener("mousemove", this._handlerMouseMove);
                this._handlerMouseMove = null;
                Emitter.prototype.destructor.call(this);
            },
            _onMouseMove: function (_event) {
                var bounds = this.element.getBoundingClientRect();
                var cond0 = _event.pageX >= bounds.x && _event.pageX <= bounds.x + bounds.width;
                var cond1 = _event.pageY >= bounds.y && _event.pageY <= bounds.y + bounds.height;
                if(!this._isInside) {
                    if(cond0 && cond1) this._show(_event);
                } else {
                    if(!cond0 || !cond1) this.hide(_event);
                }
            },
            _show: function (_event){
                var find = false;
                var temp = _event.target;
                while(!(temp === null || temp === document.body)) {
                    find = temp === this.element;
                    if(find) break;
                    temp = temp.parentElement;
                }

                if(!find) return;

                this._isInside = true;
                this.emit("mouseIn", _event);
            },
            hide: function  (_event){
                this._isInside = false;
                this.emit("mouseOut", _event);
            }
        });

        return MouseObserver
    })
})();