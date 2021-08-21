import {CharactersStore} from "../../../store/modules/characters/charactersStore.js";
import MultipleProvider from "../base/multipleProvider.js";
import CharactersListProvider from "./characterListProvider";

/**
 * @property {CharactersListProvider} list
 */
class Characters extends MultipleProvider {
    constructor() {
        super();

        this._vuexModulePath = ["characters"];
        this._vuexTemplate = CharactersStore;

        this.addProvider("list", () => new CharactersListProvider());
    }
}

export default Characters;