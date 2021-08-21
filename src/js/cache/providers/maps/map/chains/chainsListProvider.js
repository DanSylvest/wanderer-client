import ListProvider from "../../../base/listProvider";
import Chain from "./chain";

export default class ChainsListProvider extends ListProvider {
    constructor(mapId) {
        super();
        this.mapId = mapId;
    }
    destructor() {
        delete this.mapId;
        super.destructor();
    }

    _createModel(id) {
        return new Chain(this.mapId, id);
    }

    /**
     *
     * @param id
     * @returns {Chain}
     */
    get(id) {
        return super.get(id);
    }

    markAsRemoved (id) {
        this.has(id) && this.get(id).markAsRemoved();
    }
}