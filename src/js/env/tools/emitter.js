/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */


class Emitter {
    constructor() {
        this._counter = 0;
        this._handlers = Object.create(null);
        this._types = Object.create(null);
    }

    destructor() {
        this._handlers = Object.create(null);
        this._types = Object.create(null);
        this._counter = 0;
    }

    on(_type, _func, isOne) {
        if (!(_func instanceof Function))
            throw "_func in not a function";

        let hid = this._counter++;
        this._handlers[hid] = {
            type: _type,
            func: _func,
            isOne: !!isOne
        };

        if (!this._types[_type])
            this._types[_type] = [];

        this._types[_type].push(hid);

        return hid;
    }

    one(_type, _func) {
        return this.on(_type, _func, true);
    }

    off(_hid) {
        if (this._handlers[_hid]) {
            let info = this._handlers[_hid];
            let index = this._types[info.type].indexOf(_hid);
            this._types[info.type].splice(index, 1);
        }
    }

    emit() {
        let type = arguments[0];
        let args = Array.prototype.slice.call(arguments, 1);

        let forOff = [];
        if (this._types[type]) {
            let safe = this._types[type].slice(0);
            for (let a = 0; a < safe.length; a++) {
                let data = this._handlers[safe[a]];
                data.isOne && forOff.push(safe[a]);
                data.func.apply(null, args);
            }
        }

        forOff.map(x => this.off(x));
    }
}

export default Emitter;