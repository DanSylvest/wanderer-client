/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 2/15/21.
 */
 
import Emitter from "../../env/tools/emitter.js";
import api from "../../api.js";
import ServerStatusStore from "../../store/modules/serverStatusStore.js";
import store from "../../store";

class ServerStatus extends Emitter {
    constructor() {
        super();

        this._count = 0;
        this._onlineSubscriber = api.eve.subscribeStatus();
        this._onlineSubscriber.on("change", this._onChange.bind(this));
    }

    destructor() {
        super.destructor();
    }

    subscribe () {
        this._increaseSubscriber();
        return () => this._decreaseSubscriber();
    }

    _increaseSubscriber () {
        this._count++;

        if(this._count === 1) {
            this._registerModule();
            this._onlineSubscriber.subscribe();
        }
    }

    _decreaseSubscriber () {
        this._count--;

        if(this._count === 0) {
            this._onlineSubscriber.unsubscribe();
            this._unregisterModule();
        }
    }

    // eslint-disable-next-line no-unused-vars
    _onChange (data) {
        if(data.isOnline)
            store.dispatch("eveServerStatus/setOnline");
        else
            store.dispatch("eveServerStatus/setOffline");
    }

    _registerModule () {
        store.registerModule(["eveServerStatus"], ServerStatusStore);
    }

    _unregisterModule () {
        store.unregisterModule(["eveServerStatus"]);
    }
}

export default ServerStatus;