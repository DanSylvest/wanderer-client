/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/22/20.
 */

import Emitter from "./tools/emitter.js";
let counter = 0;

class Observer extends Emitter {
    constructor(timeout) {
        super();

        this._timeout = timeout || 1000;
        this._tid = -1;
        this._subscribers = Object.create(null);
        this._subscribersCount = 0;
    }
    destructor () {
        this._isStarted = false;
        this._tid !== -1 && clearTimeout(this._tid);
        this._tid = -1;
        this._subscribers = Object.create(null);
        this._subscribersCount = 0;

        super.destructor();
    }
    subscribe () {
        this._tid !== -1 && clearTimeout(this._tid);
        this._tid = -1;

        let id = counter++;
        this._subscribers[id] = true;
        this._subscribersCount++;

        if(this._subscribersCount === 1 && !this._isStarted) {
            this._isStarted = true;
            this.emit("started");
        }
        return id;
    }
    unsubscribe (_id) {
        if(this._subscribers[_id]) {
            this._subscribersCount--;
            delete this._subscribers[_id];

            if(this._subscribersCount === 0) {
                this._tid = setTimeout(this._onTimeout.bind(this), this._timeout);
            }
        }
    }
    _onTimeout () {
        this._isStarted = false;
        this._tid = -1;
        this.emit("stopped");
    }
    count () {
        return this._subscribersCount;
    }

}

export default Observer;