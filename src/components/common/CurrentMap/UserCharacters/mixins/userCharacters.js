import SpamFilter from "../../../../../js/env/spamFilter.js";
import exists from "../../../../../js/env/tools/exists.js";
import cache from "../../../../../js/cache/cache.js";

export const UserCharactersMixin = {
    props: {
        mapId: {
            type: String,
            default: null
        }
    },
    data: function () {
        return {
            mapId_: this.mapId,
            loadedUserCharacters: false,
        }
    },
    watch: {
        mapId(val) {
            this.mapId_ = val;
            this.userCharactersData.delayedAttrUpdate.call();
        }
    },
    mounted() {
        this.userCharactersData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeDestroy() {
        unsubscribeData.call(this);
        destroyDelayedUpdater.call(this);
        delete this.userCharactersData;
    },
    computed: {
        /**
         *
         * @returns {Array.<{online: boolean, charId: string}>}
         */
        userCharactersList() {
            return this.loadedUserCharacters ? this.$store.state.maps[this.mapId_].userCharacters.value : [];
        }
    },
    methods: {
        _onLoadedUserCharacters() {
            this.loadedUserCharacters = true;
        }
    }
}

const createDelayedUpdater = function () {
    this.userCharactersData.delayedAttrUpdate = new SpamFilter(watchAttrsUpdated.bind(this), 10);
    isValidAttrs.call(this) && this.userCharactersData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.userCharactersData.delayedAttrUpdate.stop();
    delete this.userCharactersData.delayedAttrUpdate;
}

const isValidAttrs = function () {
    return exists(this.mapId_) && this.mapId_ !== "";
}

const watchAttrsUpdated = function () {
    if (isValidAttrs.call(this)) {
        unsubscribeData.call(this);
        subscribeData.call(this);
    }
}

const unsubscribeData = function () {
    if (exists(this.userCharactersData.unsubscriberUserCharacters)) {
        this.userCharactersData.unsubscriberUserCharacters();
        delete this.userCharactersData.unsubscriberUserCharacters;
    }
}

const subscribeData = function () {
    this.loadedUserCharacters = false;

    const userCharacters = cache.maps.list.get(this.mapId_).userCharacters;
    this.userCharactersData.unsubscriberUserCharacters = userCharacters.subscribe();
    userCharacters.readyPromise().then(this._onLoadedUserCharacters.bind(this));
}

