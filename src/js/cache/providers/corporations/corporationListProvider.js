import ListProvider from "../base/listProvider";
import Corporation from "./corporation";

export default class CorporationListProvider extends ListProvider {
    _createModel(id) {
        return new Corporation(id);
    }

    /**
     *
     * @param id
     * @returns {Corporation}
     */
    get(id) {
        return super.get(id);
    }
}