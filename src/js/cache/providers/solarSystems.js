/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 3/21/21.
 */

import Emitter from "../../env/tools/emitter.js";
import store from "../../store";
import SolarSystemStore from "../../store/modules/solarSystemStore.js";
import api from "../../api.js";
import CustomPromise from "../../env/promise.js";

const LIFE_TIME = 1000 * 60 * 20;

class SolarSystem extends Emitter{
    constructor(solarSystemId) {
        super();

        this._solarSystemId = solarSystemId;
        this._count = 0;
        this._unregisterTimerId = -1;
        this._needLoadData = true;
        this._data = null;
        this._readyPromise = new CustomPromise();
    }
    destructor() {
        this._clearTimeout();
        super.destructor();
    }
    subscribe () {
        this._increaseSubscriber();
        return () => this._decreaseSubscriber();
    }
    _clearTimeout () {
        this._unregisterTimerId !== -1 && clearTimeout(this._unregisterTimerId);
        this._unregisterTimerId = -1;
    }
    _increaseSubscriber () {
        this._count++;

        if(this._count === 1) {
            this._registerModule();

            if(this._needLoadData) {
                this._needLoadData = false;
                api.eve.universe.solarSystemInfo(this._solarSystemId)
                    .then(
                        this._onGetData.bind(this),
                        err => {
                            this._readyPromise.reject();

                            window.vueApp.showErrorModal({
                                title: "Error",
                                message: err && err.message || `Error on load SolarSystemInfo [${this._solarSystemId}]`,
                            });
                        }
                    )
            }
        }
    }
    _decreaseSubscriber () {
        this._count--;

        if(this._count === 0) {
            this._unregisterTimerId = setTimeout(this._unregisterModule.bind(this), LIFE_TIME);
        }
    }
    _onGetData (data) {
        this._data = data;

        store.dispatch(`solarSystems/${this._solarSystemId}/setData`, {
            systemClass: data.systemClass,
            security: data.security,
            solarSystemId: data.solarSystemId,
            constellationId: data.constellationId,
            regionId: data.regionId,
            solarSystemName: data.solarSystemName,
            constellationName: data.constellationName,
            regionName: data.regionName,
            systemType: data.systemType,
            typeDescription: data.typeDescription,
            typeName: data.typeName,
            isShattered: data.isShattered,
            effectType: data.effectType,
            effectName: data.effectName,
            effectData: data.effectData,
            statics: data.statics,
            solarSystemNameLC: data.solarSystemNameLC,
            triglavianInvasionStatus: data.triglavianInvasionStatus,
        });

        this.emit("changed", this._data);
        this._readyPromise.resolve();
    }
    _registerModule () {
        this._clearTimeout();

        if(!store.hasModule(["solarSystems", this._solarSystemId]))
            store.registerModule(["solarSystems", this._solarSystemId], SolarSystemStore);
    }
    _unregisterModule () {
        this._clearTimeout();

        store.unregisterModule(["solarSystems", this._solarSystemId]);

        this.emit("unregistered");
    }
    count () {
        return this._count;
    }
    data () {
        return this._data;
    }
    readyPromise () {
        return this._readyPromise.native;
    }
    on(_type, _func, isOne) {
        let id = super.on(_type, _func, isOne);

        if(!this._needLoadData && this._data !== null && _type === "changed") {
            _func.call(null, this._data);
        }

        return id;
    }
}

class SolarSystems extends Emitter {
    constructor() {
        super();

        this._solarSystems = Object.create(null);
        store.registerModule(["solarSystems"], {
            namespaced: true,
        });
    }
    destructor() {
        store.unregisterModule(["solarSystems"]);
        super.destructor();
    }
    touch(solarSystemId) {
        if(!this._solarSystems[solarSystemId]) {
            this._solarSystems[solarSystemId] = new SolarSystem(solarSystemId);
            this._solarSystems[solarSystemId].on("unregistered", this._onSystemUnregistered.bind(this, solarSystemId))
        }

        return {
            unsubscribe: this._solarSystems[solarSystemId].subscribe(),
            item: this._solarSystems[solarSystemId]
        };
    }
    _onSystemUnregistered (solarSystemId) {
        this._solarSystems[solarSystemId].destructor();
        delete this._solarSystems[solarSystemId];
    }
}

export default SolarSystems;