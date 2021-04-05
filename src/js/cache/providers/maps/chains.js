import Emitter from "../../../env/tools/emitter.js";
import store from "../../../store";
import CustomPromise from "../../../env/promise.js";
import Observer from "../../../env/observer.js";
import api from "../../../api.js";
import ChainsStore from "../../../store/modules/maps/chainsStore.js";
import ChainStore from "../../../store/modules/maps/chainStore.js";
const LIFE_TIME = 1000 * 60 * 20;


class Chain extends Emitter{
    constructor(mapId, chainId) {
        super();

        this._chainId = chainId;
        this._mapId = mapId;
        this._unregisterTimerId = -1;
        this._needLoadData = true;
        this._dataLoaded = false;
        this._data = {};
        this._readyPromise = new CustomPromise();

        this.observer = new Observer(LIFE_TIME);
        this.observer.on("started", this._onObserverStarted.bind(this));
        this.observer.on("stopped", this._onObserverStopped.bind(this));
    }
    destructor() {
        this.observer.destructor();
        super.destructor();
    }
    subscribe () {
        let sid = this.observer.subscribe();
        return () => this.observer.unsubscribe(sid);
    }
    _onObserverStarted () {
        this._registerModule();

        if(this._needLoadData) {
            this._needLoadData = false;
            this._dataSubscriber = api.eve.map.link.subscribeData(this._mapId, this._chainId);
            this._dataSubscriber.on("change", this._onSubscriptionDataChange.bind(this));
            this._dataSubscriber.subscribe();
        }
    }
    _onObserverStopped () {
        this._readyPromise.native.cancel();
        this._unregisterModule();
    }
    _onSubscriptionDataChange (event) {
        if(!this._dataLoaded)
            this._dataLoaded = true;

        let data = event.data;

        switch (event.type) {
            case "multipleEvents":
                event.data.map(this._onSubscriptionDataChange.bind(this));
                break;
            case "bulk":
            case "updated":
                this._data = {...this._data, ...event.data};
                break;
        }

        store.dispatch(`maps/${this._mapId}/chains/${this._chainId}/update`, data);

        if(event.type === "bulk")
            this._readyPromise.resolve();

        this.emit("changed", this._data);
    }
    _registerModule () {
        if(!store.hasModule(["maps", this._mapId, "chains", this._chainId]))
            store.registerModule(["maps", this._mapId, "chains", this._chainId], ChainStore);
    }
    _unregisterModule () {
        store.unregisterModule(["maps", this._mapId, "chains", this._chainId]);
        this._dataSubscriber.unsubscribe();

        this.emit("unregistered");
    }
    count () {
        return this.observer.count();
    }
    data () {
        return this._data;
    }
    readyPromise () {
        return this._readyPromise.native;
    }
    on(_type, _func, isOne) {
        let id = super.on(_type, _func, isOne);

        if(!this._needLoadData && this._dataLoaded && _type === "changed") {
            _func.call(null, this._data);
        }

        return id;
    }
}

class ChainsController extends Emitter {
    constructor(mapId) {
        super();

        this._readyPromise = new CustomPromise();
        this._chains = [];
        this._needLoadData = true;
        this._mapId = mapId;
        this.observer = new Observer(LIFE_TIME);
        this.observer.on("started", this._onObserverStarted.bind(this));
        this.observer.on("stopped", this._onObserverStopped.bind(this));
    }
    destructor() {
        this._readyPromise.native.cancel();
        this._subscriber && this._subscriber.destructor();
        this._needLoadData = false;
        this.observer.destructor();
        super.destructor();
    }
    _onObserverStarted () {
        if(this._needLoadData) {
            this._needLoadData = false;
            this._subscriber = api.eve.map.link.subscribeLinks(this._mapId);
            this._subscriber.on("change", this._onSubscriptionChange.bind(this));
            this._subscriber.subscribe();
        }
    }
    _onObserverStopped () {
        this.emit("unregistered");
    }
    _onSubscriptionChange (data) {
        switch (data.type) {
            case "bulk":
                this._chains = this._chains.concat(data.list);
                this._readyPromise.resolve();
                break;
            case "add":
                this._chains.push(data.solarSystemId);
                break;
            case "removed":
                this._chains.removeByValue(data.systemId);
                break;
        }

        store.dispatch(`maps/${this._mapId}/solarSystems/update`, this._chains);

        this.emit("changedEvent", data);
        this.emit("changed", this._chains);
    }
    count () {
        return this.observer.count()
    }
    data () {
        return this._chains;
    }
    readyPromise () {
        return this._readyPromise.native;
    }
    on(_type, _func, isOne) {
        let id = super.on(_type, _func, isOne);

        if(!this._needLoadData && this._chains.length > 0 && _type === "changedEvent") {
            _func.call(null, {
                type: "bulk",
                list: this._chains
            });
        }

        return id;
    }
}

class Chains extends Emitter {
    constructor(mapId) {
        super();

        this._mapId = mapId;
        this._items = Object.create(null);

        this.chainsController = new ChainsController(this._mapId);
        this.chainsController.on("unregistered", this._unregisterModule.bind(this));
    }
    destructor() {
        this.chainsController.destructor();
        this._items = Object.create(null);

        super.destructor();
    }

    /**
     * We should think that system can not be touched before system loaded.
     * @param id
     * @returns {{item: *, unsubscribe: *}}
     */
    touch(id) {
        if(!this._items[id]) {
            this._items[id] = new Chain(this._mapId, id);
            this._items[id].on("unregistered", this._onSystemUnregistered.bind(this, id))
        }

        this._registerModule();

        return {
            unsubscribe: this._items[id].subscribe(),
            item: this._items[id]
        };
    }
    _onSystemUnregistered (id) {
        this._items[id].destructor();
        delete this._items[id];
        this._unregisterModule();
    }
    _registerModule () {
        if (!store.hasModule(["maps", this._mapId, "chains"])) {
            this.emit("registered");
            store.registerModule(["maps", this._mapId, "chains"], ChainsStore);
        }
    }
    _unregisterModule () {
        if(!this.hasSubModules()) {
            store.unregisterModule(["maps", this._mapId, "chains"]);
            this.emit("unregistered");
        }
    }
    countOfSubModules () {
        return Object.keys(this._items).length;
    }
    hasSubModules () {
        return this.countOfSubModules() > 0 || this.chainsController.count() > 0;
    }
    subscribe () {
        let sid = this.chainsController.observer.subscribe();

        this._registerModule();

        return {
            unsubscribe: () => this.chainsController.observer.unsubscribe(sid),
            item: this.chainsController
        };
    }
}

export default Chains;