import SpamFilter from "../../js/env/spamFilter.js";
import exists from "../../js/env/tools/exists.js";
import cache from "../../js/cache/cache.js";

const ShipMixin = {
    props: {
        shipId: {
            type: Number,
            default: null
        }
    },
    data: function () {
        return {
            loadedShip: false,
            lShipId: this.shipId
        }
    },
    watch: {
        shipId (val) {
            this.lShipId = val;
            this.shipData.delayedAttrUpdate.call();
        }
    },
    mounted () {
        this.shipData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeDestroy() {
        unsubscribeData.call(this);
        destroyDelayedUpdater.call(this);
        delete this.shipData;
    },
    computed : {
        shipInfo () {
            return this.$store.state.ships[this.lShipId].info;
        }
    },
    methods: {
        onLoadedShip () {
            this.loadedShip = true;
        },
        watchAttrsUpdatedShip () {
            if(isValidAttrs.call(this)) {
                unsubscribeData.call(this);
                subscribeData.call(this);
            }
        }
    }
}

const createDelayedUpdater = function () {
    this.shipData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedShip.bind(this), 10);
    isValidAttrs.call(this) && this.shipData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.shipData.delayedAttrUpdate.stop();
    delete this.shipData.delayedAttrUpdate;
}

const isValidAttrs = function () {
    return exists(this.lShipId);
}

const unsubscribeData = function () {
    if(exists(this.shipData.unsubscribe)) {
        this.shipData.unsubscribe();
        delete this.shipData.unsubscribe;
    }
}
const subscribeData = function () {
    this.loadedShip = false;

    this.shipData.unsubscribe = cache.ships.list.get(this.lShipId).info.subscribe();

    Promise.all([
        cache.ships.list.get(this.lShipId).info.readyPromise(),
    ])
        .then(this.onLoadedShip.bind(this));
}

export default ShipMixin;