/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */
import Emitter from "./tools/emitter";

class TabObserver extends Emitter {
    constructor () {
        super();
        this._handler = this._onChange.bind(this);

        document.addEventListener("visibilitychange", this._handler);
    }
    destructor () {
        window.removeEventListener("visibilitychange", this._handler);
        Emitter.prototype.destructor.call(this);
    }
    _onChange () {
        document.hidden ? this.emit("out") : this.emit("in");
    }
}

export default TabObserver;