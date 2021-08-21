import ListProvider from "../base/listProvider";
import Map from "./map/map";

export default class MapsListProvider extends ListProvider {
    _createModel(id) {
        return new Map(id);
    }

    /**
     *
     * @param id
     * @returns {Map}
     */
    get(id) {
        return super.get(id);
    }
}