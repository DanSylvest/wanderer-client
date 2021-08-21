import ListProvider from "../../../base/listProvider";
import SolarSystem from "./solarSystem";

export default class SolarSystemsListProvider extends ListProvider {
    constructor(mapId) {
        super();
        this.mapId = mapId;
    }

    destructor() {
        delete this.mapId;
        super.destructor();
    }

    _createModel(id) {
        return new SolarSystem(this.mapId, id);
    }

    /**
     *
     * @param id
     * @returns {SolarSystem}
     */
    get(id) {
        return super.get(id);
    }

    markAsRemoved (id) {
        this.has(id) && this.get(id).markAsRemoved();
    }
}