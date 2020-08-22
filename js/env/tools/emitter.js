/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

(function () {
    var moduleName = "env/tools/emitter";
    
    var deps = [
        "env/tools/class"
    ];
    
    define(moduleName, deps, function () {
        var create_class = require("env/tools/class");

        var emitter = create_class("emitter", null, {
            constructor: function () {
                this._counter = 0;
                this._handlers = Object.create(null);
                this._types = Object.create(null);
            },
            destructor: function(){
                this._handlers = Object.create(null);
                this._types = Object.create(null);
                this._counter = 0;
            },
            on: function (_type, _func) {
                if(!(_func instanceof Function))
                    throw "_func in not a function";

                var hid = this._counter++;
                this._handlers[hid] = {
                    type: _type,
                    func: _func
                };

                if(!this._types[_type])
                    this._types[_type] = [];

                this._types[_type].push(hid);

                return hid;
            },
            off: function (_hid) {
                if(this._handlers[_hid]){
                    var info = this._handlers[_hid];
                    var index = this._types[info.type].indexOf(_hid);
                    this._types[info.type].splice(index, 1);
                }
            },
            emit: function () {
                var type = arguments[0];
                var args = Array.prototype.slice.call(arguments, 1);

                if(this._types[type]) {
                    for (var a = 0; a < this._types[type].length; a++)
                        this._handlers[this._types[type]].func.apply(null, args);
                }
            }
        });

        return emitter;
    })    
})();