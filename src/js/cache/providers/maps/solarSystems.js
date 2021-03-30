import Emitter from "../../../env/tools/emitter.js";
import extend from "../../../env/tools/extend.js";
import api from "../../../api.js";
import store from "../../../store";
import SolarSystemStore from "../../../store/modules/maps/solarSystemStore.js";
import SolarSystemsStore from "../../../store/modules/maps/solarSystemsStore.js";
import CustomPromise from "../../../env/promise.js";
import Observer from "../../../env/observer.js";

const LIFE_TIME = 1000 * 60 * 20;

class SolarSystem extends Emitter{
    constructor(mapId, solarSystemId) {
        super();

        this._solarSystemId = solarSystemId;
        this._mapId = mapId;
        this._unregisterTimerId = -1;
        this._needLoadData = true;
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
            this._dataSubscriber = api.eve.map.solarSystem.subscribeData(this._mapId, this._solarSystemId);
            this._dataSubscriber.on("change", this._onSubscriptionDataChange.bind(this));
            this._dataSubscriber.subscribe();
        }
    }
    _onObserverStopped () {
        this._readyPromise.native.cancel();
        this._unregisterModule();
    }
    _onSubscriptionDataChange (event) {
        let data = event.data;

        switch (event.type) {
            case "multipleEvents":
                event.data.map(this._onSubscriptionDataChange.bind(this));
                break;
            case "bulk":
            case "systemUpdated":
            case "updatedSystemsPosition":
            case "onlineUpdate":
                this._data = extend(this._data, event.data);
                break;
            case "userJoin":
                this._data.onlineCharacters.push(event.data.characterId);
                data = {onlineCharacters: this._data.onlineCharacters};
                break;
            case "userLeave":
                this._data.onlineCharacters.removeByValue(event.data.characterId);
                data = {onlineCharacters: this._data.onlineCharacters};
                break;
        }

        store.dispatch(`maps/${this._mapId}/solarSystems/${this._solarSystemId}/update`, data);

        if(event.type === "bulk")
            this._readyPromise.resolve();

        this.emit("changed", this._data);
    }
    _registerModule () {
        if(!store.hasModule(["maps", this._mapId, "solarSystems", this._solarSystemId]))
            store.registerModule(["maps", this._mapId, "solarSystems", this._solarSystemId], SolarSystemStore);
    }
    _unregisterModule () {
        store.unregisterModule(["maps", this._mapId, "solarSystems", this._solarSystemId]);
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
}

class SystemsController extends Emitter {
    constructor(mapId) {
        super();

        this._readyPromise = new CustomPromise();
        this._systems = [];
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
            this._subscriber = api.eve.map.solarSystem.subscribeSolarSystems(this._mapId);
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
                this._systems = this._systems.concat(data.list);
                this._readyPromise.resolve();
                break;
            case "add":
                this._systems.push(data.solarSystemId);
                break;
            case "removed":
                this._systems.removeByValue(data.systemId);
                break;
        }

        store.dispatch(`maps/${this._mapId}/solarSystems/update`, this._systems);

        this.emit("changedEvent", data);
        this.emit("changed", this._systems);
    }

    count () {
        return this.observer.count()
    }

    data () {
        return this._systems;
    }

    readyPromise () {
        return this._readyPromise.native;
    }

    on(_type, _func, isOne) {
        let id = super.on(_type, _func, isOne);

        if(!this._needLoadData && this._systems.length > 0) {
            this.emit("changedEvent", {
                type: "bulk",
                list: this._systems
            });
        }

        return id;
    }
}

class SolarSystems extends Emitter {
    constructor(mapId) {
        super();

        this._mapId = mapId;
        this._items = Object.create(null);

        this.sc = new SystemsController(this._mapId);
        this.sc.on("unregistered", this._unregisterModule.bind(this));
    }
    destructor() {
        this.sc.destructor();
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
            this._items[id] = new SolarSystem(this._mapId, id);
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
        if (!store.hasModule(["maps", this._mapId, "solarSystems"])) {
            this.emit("registered");
            store.registerModule(["maps", this._mapId, "solarSystems"], SolarSystemsStore);
        }
    }

    _unregisterModule () {
        if(!this.hasSubModules()) {
            store.unregisterModule(["maps", this._mapId, "solarSystems"]);
            this.emit("unregistered");
        }
    }

    countOfSubModules () {
        return Object.keys(this._items).length;
    }

    hasSubModules () {
        return this.countOfSubModules() > 0 || this.sc.count() > 0;
    }

    subscribe () {
        let sid = this.sc.observer.subscribe();

        this._registerModule();

        return {
            unsubscribe: () => this.sc.observer.unsubscribe(sid),
            item: this.sc
        };
    }
}

export default SolarSystems;