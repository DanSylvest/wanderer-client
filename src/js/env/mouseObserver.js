/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 8/30/20.
 */
import Emitter from "./tools/emitter";
import exists from "./tools/exists";

class MouseObserver extends Emitter {
    constructor(_element, _delay) {
        super();

        this._useDelay = exists(_delay);
        this.delay = _delay;
        this.element = _element;
        this._isInside = false;
        this._handlerMouseMove = this._onMouseMove.bind(this);
        this._tid = -1;

        window.addEventListener("mousemove", this._handlerMouseMove);
    }
    destructor() {
        window.removeEventListener("mousemove", this._handlerMouseMove);
        this._handlerMouseMove = null;
        Emitter.prototype.destructor.call(this);
    }
    _onMouseMove(_event) {
        let bounds = this.element.getBoundingClientRect();
        let cond0 = _event.pageX >= bounds.x && _event.pageX <= bounds.x + bounds.width;
        let cond1 = _event.pageY >= bounds.y && _event.pageY <= bounds.y + bounds.height;
        if(!this._isInside) {
            if(cond0 && cond1) this._show(_event);
        } else {
            if(!cond0 || !cond1) this.hide(_event);
        }
    }
    _onTick(_event) {
        this._tid = -1;
        this.emit("mouseIn", _event);
    }
    _show(_event){
        let find = false;
        let temp = _event.target;
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
    }
    hide (_event){
        this._tid !== -1 && clearTimeout(this._tid);
        this._isInside = false;
        this.emit("mouseOut", _event);
    }
}

export default MouseObserver;