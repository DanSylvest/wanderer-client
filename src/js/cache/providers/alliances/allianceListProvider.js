import ListProvider from "../base/listProvider";
import Alliance from "./alliance";

export default class AllianceListProvider extends ListProvider {
    _createModel(id) {
        return new Alliance(id);
    }

    /**
     *
     * @param id
     * @returns {Alliance}
     */
    get(id) {
        return super.get(id);
    }
}