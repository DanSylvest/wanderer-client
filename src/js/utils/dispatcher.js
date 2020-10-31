/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 4/11/20.
 */

import extend from "../env/tools/extend";
import log from "./log";
import Emitter from "../env/tools/emitter";
import Connector from "./connector";

let counter = 0;
class Dispatcher extends Emitter {
    constructor (_options) {
        super();

        let base = extend({
            protocol: null,
            host: null,
            port: null
        }, _options);

        this._connector = null;
        this._subscribers = Object.create(null);

        this._protocol = base.protocol;
        this._host = base.host;
        this._port = base.port;

        this.startConnector();
    }

    startConnector() {
        this._connector = new Connector({
            protocol: this._protocol,
            host: this._host,
            port: this._port
        });
        this._connector.on("data", this._onData.bind(this));
        this._connector.on("closed", this._onClosed.bind(this));
    }

    _onData (_event) {
        if (_event.eventType === "newConnection") {
            log(log.INFO, "Client Ready");
            this.emit("ready", _event);
        } else {
            let info = this._subscribers[_event.responseId];
            if (info) {
                info.callback(_event);
            } else {
                log(log.WARN, "Default event handler (%s)", _event.route.join("."));
            }
        }
    }

    _onClosed (_data) {
        log(log.INFO, "Socket closed");
        this.emit("closed", _data);
    }

    add (_callback) {
        let id = counter++;
        this._subscribers[id] = new _data(null, _callback);
        return id;
    }

    remove (_sid) {
        delete this._subscribers[_sid];
    }

    send (_responseId, _route, _data) {
        this._connector.send({
            responseId: _responseId,
            route: _route,
            data: _data
        });
    }
}

let _data = function _data(_data, _callback) {
    this.data = _data;
    this.callback = _callback;
};

export default Dispatcher;