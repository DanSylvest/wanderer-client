import SpamFilter from "../../js/env/spamFilter.js";
import exists from "../../js/env/tools/exists.js";
import cache from "../../js/cache/cache.js";

const CharacterMixin = {
    props: {
        characterId: {
            type: String,
            default: null
        }
    },
    data: function () {
        return {
            lCharacterId: this.characterId,
            loadedCharacter: false,
            loadDynamicCharacterData: false
        }
    },
    watch: {
        characterId (val) {
            this.lCharacterId = val;
            this.characterData.delayedAttrUpdate.call();
        }
    },
    mounted () {
        this.characterData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeDestroy() {
        unsubscribeData.call(this);
        destroyDelayedUpdater.call(this);
        delete this.characterData;
    },
    computed: {
        online () {
            return this.$store.state.characters[this.lCharacterId].online.value;
        },
        location () {
            return this.$store.state.characters[this.lCharacterId].location.value;
        },
        ship () {
            return this.$store.state.characters[this.lCharacterId].ship.value;
        },
        info () {
            return this.$store.state.characters[this.lCharacterId].info;
        },
        hasAlliance () {
            return this.info.alliance !== null;
        },
        hasCorporation () {
            return this.info.corporation !== null;
        },
    },
    methods: {
        _onLoadedCharacter () {
            this.loadedCharacter = true;
        }
    }
}

const createDelayedUpdater = function () {
    this.characterData.delayedAttrUpdate = new SpamFilter(watchAttrsUpdated.bind(this), 10);
    isValidAttrs.call(this) && this.characterData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.characterData.delayedAttrUpdate.stop();
    delete this.characterData.delayedAttrUpdate;
}

const isValidAttrs = function () {
    return exists(this.lCharacterId) && this.lCharacterId !== "";
}

const watchAttrsUpdated = function () {
    if(isValidAttrs.call(this)) {
        unsubscribeData.call(this);
        subscribeData.call(this);
    }
}

const unsubscribeData = function () {
    if (this.loadDynamicCharacterData) {
        if (exists(this.characterData.unsubscriberOnline)) {
            this.characterData.unsubscriberOnline();
            delete this.characterData.unsubscriberOnline;
        }
        if (exists(this.characterData.unsubscriberLocation)) {
            this.characterData.unsubscriberLocation();
            delete this.characterData.unsubscriberLocation;
        }
        if (exists(this.characterData.unsubscriberShip)) {
            this.characterData.unsubscriberShip();
            delete this.characterData.unsubscriberShip;
        }
    }

    if (exists(this.characterData.unsubscriberInfo)) {
        this.characterData.unsubscriberInfo();
        delete this.characterData.unsubscriberInfo;
    }
}

const subscribeData = function () {
    this.loadedCharacter = false;

    if(this.loadDynamicCharacterData) {
        this.characterData.unsubscriberOnline = cache.characters.list.get(this.lCharacterId).online.subscribe();
        this.characterData.unsubscriberLocation = cache.characters.list.get(this.lCharacterId).location.subscribe();
        this.characterData.unsubscriberShip = cache.characters.list.get(this.lCharacterId).ship.subscribe();
    }

    this.characterData.unsubscriberInfo = cache.characters.list.get(this.lCharacterId).info.subscribe();

    let prarr = [
        this.loadDynamicCharacterData && cache.characters.list.get(this.lCharacterId).online.readyPromise(),
        this.loadDynamicCharacterData && cache.characters.list.get(this.lCharacterId).location.readyPromise(),
        this.loadDynamicCharacterData && cache.characters.list.get(this.lCharacterId).ship.readyPromise(),
        cache.characters.list.get(this.lCharacterId).info.readyPromise(),
    ];

    Promise.all(prarr)
        .then(this._onLoadedCharacter.bind(this));
}

export default CharacterMixin;