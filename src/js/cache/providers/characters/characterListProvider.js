import ListProvider from "../base/listProvider";
import Character from "./character";

export default class CharactersListProvider extends ListProvider {
    _createModel(id) {
        return new Character(id);
    }

    /**
     *
     * @param id
     * @returns {Character}
     */
    get(id) {
        return super.get(id);
    }
}