import Emitter from "../../js/env/tools/emitter";
import cache from "../../js/cache/cache";

export class CharacterSubscription extends Emitter {
    /**
     *
     * @type {null|string}
     */
    characterId = null;

    /**
     *
     * @type {boolean}
     */
    loaded = false;

    /**
     *
     * @type {function | undefined}
     */
    unsubscribeHandler = undefined;


    /**
     *
     * @param {string} characterId
     * @param {function | undefined} onLoad
     */
    constructor(characterId, onLoad) {
        super();

        this.onLoad = onLoad;
        this.characterId = characterId;
        this.subscribe();
    }

    destructor() {
        this.unsubscribe();
        super.destructor();
    }

    onLoaded() {
        this.loaded = true;
        this.onLoad && this.onLoad();
    }

    subscribe() {
        this.loaded = false;
        const publicInfo = cache.characters.list.get(this.characterId).publicInfo;
        this.unsubscribeHandler = publicInfo.subscribe();
        publicInfo.readyPromise().then(this.onLoaded.bind(this));
    }

    unsubscribe() {
        if (this.unsubscribeHandler) {
            this.unsubscribeHandler();
            delete this.unsubscribeHandler;
        }
    }
}