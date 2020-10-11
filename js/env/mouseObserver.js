/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 8/30/20.
 */

(function () {
    var moduleName = "env/mouseObserver";

    var deps = [
        "env/tools/class",
        "env/tools/emitter",
        "env/tools/exist",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var Emitter      = require("env/tools/emitter");
        var exists       = require("env/tools/exist");

        var MouseObserver = classCreator("MouseObserver", Emitter, {
            constructor: function (_element, _delay) {
                Emitter.prototype.constructor.call(this);

                this._useDelay = exists(_delay);
                this.delay = _delay;
                this.element = _element;
                this._isInside = false;
                this._handlerMouseMove = this._onMouseMove.bind(this);
                this._tid = -1;

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
            _onTick: function (_event) {
                this._tid = -1;
                this.emit("mouseIn", _event);
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

                if(this._useDelay) {
                    this._tid = setTimeout(this._onTick.bind(this, _event), this.delay);
                } else {
                    this.emit("mouseIn", _event);
                }
            },
            hide: function  (_event){
                this._tid !== -1 && clearTimeout(this._tid);
                this._isInside = false;
                this.emit("mouseOut", _event);
            }
        });

        return MouseObserver
    })
})();