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

    on(_type, _func) {
        if (!(_func instanceof Function))
            throw "_func in not a function";

        var hid = this._counter++;
        this._handlers[hid] = {
            type: _type,
            func: _func
        };

        if (!this._types[_type])
            this._types[_type] = [];

        this._types[_type].push(hid);

        return hid;
    }

    off(_hid) {
        if (this._handlers[_hid]) {
            var info = this._handlers[_hid];
            var index = this._types[info.type].indexOf(_hid);
            this._types[info.type].splice(index, 1);
        }
    }

    emit() {
        var type = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);

        if (this._types[type]) {
            for (var a = 0; a < this._types[type].length; a++)
                this._handlers[this._types[type]].func.apply(null, args);
        }
    }
}

export default Emitter;