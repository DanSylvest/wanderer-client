/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 3/21/21.
 */

import Emitter from "../../../env/tools/emitter.js";
import store from "../../../store";
import SolarSystems from "./solarSystems.js";
import Observer from "../../../env/observer.js";
import Chains from "./chains.js";

const LIFE_TIME = 1000 * 60 * 20;
class Map extends Emitter{
    constructor(id) {
        super();

        this._id = id;
        this._unregisterTimerId = -1;

        this.solarSystems = new SolarSystems(this._id);
        this.solarSystems.on("unregistered", this._onSSUnregistered.bind(this));
        this.solarSystems.on("registered", this._onSSRegistered.bind(this));
        this.solarSystemsUnsubscriber = null;

        this.chains = new Chains(this._id);
        this.chains.on("unregistered", this._onChainsUnregistered.bind(this));
        this.chains.on("registered", this._onChainsRegistered.bind(this));
        this.chainsUnsubscriber = null;

        this.observer = new Observer(LIFE_TIME);
        this.observer.on("started", this._registerModule.bind(this));
        this.observer.on("stopped", this._unregisterModule.bind(this));
    }
    destructor() {
        this.observer.destructor();
        super.destructor();
    }
    _onSSRegistered () {
        this.solarSystemsUnsubscriber = this.subscribe();
    }
    _onSSUnregistered () {
        this.solarSystemsUnsubscriber();
    }
    _onChainsRegistered () {
        this.chainsUnsubscriber = this.subscribe();
    }
    _onChainsUnregistered () {
        this.chainsUnsubscriber();
    }
    subscribe () {
        let sid = this.observer.subscribe();
        return () => this.observer.unsubscribe(sid);
    }
    _registerModule () {
        if(!store.hasModule(["maps", this._id]))
            store.registerModule(["maps", this._id], {
                namespaced: true
            });
    }
    _unregisterModule () {
        store.unregisterModule(["maps", this._id]);

        this.emit("unregistered");
    }
    count () {
        return this.observer.count();
    }

}

class Maps extends Emitter {
    constructor() {
        super();

        this._items = Object.create(null);
        store.registerModule(["maps"], {
            namespaced: true,
        });
    }
    destructor() {
        store.unregisterModule(["maps"]);
        super.destructor();
    }
    touch(itemId) {
        if(!this._items[itemId]) {
            this._items[itemId] = new Map(itemId);
            this._items[itemId].on("unregistered", this._onSystemUnregistered.bind(this, itemId))
        }

        return {
            unsubscribe: this._items[itemId].subscribe(),
            item: this._items[itemId]
        };
    }
    _onSystemUnregistered (itemId) {
        this._items[itemId].destructor();
        delete this._items[itemId];
    }
    countOfSubModules () {
        return Object.keys(this._items).length;
    }
    hasSubModules () {
        return this.countOfSubModules() > 0;
    }

}

export default Maps;