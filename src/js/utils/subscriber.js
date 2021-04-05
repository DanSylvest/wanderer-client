/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/23/20.
 */

import CustomPromise from "../env/promise";
import Emitter from "../env/tools/emitter";
import extend from "../env/tools/extend";

class Subscriber extends Emitter {
    constructor(_options) {
        let base = extend({
            dispatcher: null,
            path: null,
        }, _options);

        super();

        this._dispatcher = base.dispatcher;
        this._path = base.path;

        this._handlerId = -1;
    }

    _createHandler() {
        this._handlerId = this._dispatcher.add(this._eventHandler.bind(this));
    }

    subscribe() {
        this._subscribePormise = new CustomPromise();
        this._createHandler();
        this._dispatcher.send(this._handlerId, this._path, this._sendData());
        return this._subscribePormise.native;
    }

    unsubscribe() {
        // todo also we must send unsubscribe event
        let unsubscribePath = this._path.slice();
        unsubscribePath.push("unsubscribe");

        this._dispatcher.send(this._handlerId, unsubscribePath, this._sendData());

        this._dispatcher.remove(this._handlerId);
        this._handlerId = -1;
    }

    // eslint-disable-next-line no-unused-vars
    _eventHandler(_event) {
        // do nothing
    }

    _sendData() {
        return {

        }
    }

    notify(_data) {
        this.emit("change", _data);
        this._subscribePormise.resolve();
    }
}

export default Subscriber;