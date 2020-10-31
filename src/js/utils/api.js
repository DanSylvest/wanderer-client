/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 10/16/20.
 */

import extend from "./../env/tools/extend";
import Emitter from "./../env/tools/emitter";
import Dispatcher from "./dispatcher";

class API extends Emitter {

    constructor(_options) {
        super();

        this.options = extend({
            protocol: null,
            host: null,
            port: null,
            handlers: {}
        }, _options);

        this._status = "not_ready";

        Emitter.prototype.constructor.call(this);

        this._handlers = {};
    }

    init() {
        this.dispatcher = new Dispatcher({
            protocol: this.options.protocol,
            host: this.options.host,
            port: this.options.port
        });

        this.dispatcher.on("ready", function() {
            this._status = "ready";
            this.emit("ready");
        }.bind(this));

        this._upgradeHandlers(this.options.handlers)
    }

    _upgradeHandlers(_handlers) {
        let recursive = function (_key, _node, _scope) {
            switch (typeof _node) {
                case "function":
                    _scope[_key] = _node.bind(this.dispatcher);
                    break;
                case "object":
                    if (_key !== null)
                        _scope[_key] = {};

                    for (let k in _node) {
                        recursive(k, _node[k], _key !== null ? _scope[_key] : _scope);
                    }
                    break;
            }
        }.bind(this);

        recursive(null, _handlers, this);

    }

    status() {
        return this._status;
    }
}

export default API;