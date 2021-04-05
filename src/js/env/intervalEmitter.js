/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/19/20.
 */

import Emitter from "./tools/emitter.js";

class IntervalEmitter extends Emitter {
    constructor(_delay, _interval) {
        super();

        this._delay = _delay;
        this._interval = _interval;
        this._tid = -1;
    }

    destructor() {
        this.stop();
        super.destructor();
    }

    __tick () {
        let delta = +new Date - this._startTime;
        this._tid = -1;
        this.emit("interval", this._delay - delta);

        if(this._delay - delta >= 0) {
            this.__interval();
        } else {
            this.emit("expired");
        }
    }

    __interval () {
        this._tid !== -1 && clearTimeout(this._tid);
        this._tid = setTimeout(this.__tick.bind(this), this._interval);
    }

    start () {
        this._startTime = +new Date;

        this.__interval();
    }

    stop () {
        this._tid !== -1 && clearTimeout(this._tid);
        this._tid = -1;
    }
}

export default IntervalEmitter;