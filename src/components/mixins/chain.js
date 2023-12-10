import SpamFilter from "../../js/env/spamFilter.js";
import exists from "../../js/env/tools/exists.js";
import cache from "../../js/cache/cache.js";

const ChainMixin = {
    props: {
        chainId: {
            type: String,
            default: null
        },
        mapId: {
            type: String,
            default: null
        }
    },
    data: function () {
        return {
            loadedChain: false,
            lChainId: this.chainId,
            lMapId: this.mapId
        }
    },
    watch: {
        chainId (val) {
            this.lChainId = val;
            this.chainData.delayedAttrUpdate.call();
        },
        mapId (val) {
            this.lMapId = val;
            this.chainData.delayedAttrUpdate.call();
        },
    },
    mounted () {
        this.chainData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeUnmount() {
        unsubscribeData.call(this);
        destroyDelayedUpdater.call(this);
        delete this.chainData;
    },
    computed : {
        chainInfo () {
            return this.$store.state.maps[this.lMapId].chains[this.lChainId];
        },
    },
    methods: {
        onLoadedChain () {
            this.loadedChain = true;
        },
        watchAttrsUpdatedChain () {
            if(isValidAttrs.call(this)) {
                unsubscribeData.call(this);
                subscribeData.call(this);
            }
        },
        unsubscribeDataChain () {
            unsubscribeData.call(this);
        }
    }
}

const createDelayedUpdater = function () {
    this.chainData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedChain.bind(this), 10);
    isValidAttrs.call(this) && this.chainData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.chainData.delayedAttrUpdate.stop();
    delete this.chainData.delayedAttrUpdate;
}

const isValidAttrs = function () {
    return exists(this.lChainId) && this.lChainId !== "" && exists(this.lMapId) && this.lMapId !== "";
}

const unsubscribeData = function () {
    this.loadedChain = false;

    if(exists(this.chainData.unsubscribe)) {
        this.chainData.unsubscribe();
        delete this.chainData.unsubscribe;
    }
}
const subscribeData = function () {
    this.loadedChain = false;

    this.chainData.unsubscribe = cache.maps.list.get(this.lMapId).chains.list.get(this.lChainId).subscribe();

    Promise.all([
        cache.maps.list.get(this.lMapId).chains.list.get(this.lChainId).readyPromise(),
    ])
        .then(this.onLoadedChain.bind(this));
}

export default ChainMixin;