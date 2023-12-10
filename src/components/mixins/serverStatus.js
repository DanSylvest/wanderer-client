import SpamFilter from "../../js/env/spamFilter.js";
import exists from "../../js/env/tools/exists.js";
import cache from "../../js/cache/cache.js";

const ServerStatusMixin = {
    data: function () {
        return {
            loadedServerStatus: false
        }
    },
    mounted () {
        this.serverStatusData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeUnmount() {
        unsubscribeData.call(this);
        destroyDelayedUpdater.call(this);
        delete this.serverStatusData;
    },
    computed : {
        serverStatus () {
            return this.loadedServerStatus && this.$store.state.serverStatus.value;
        }
    },
    methods: {
        onLoadedServerStatus () {
            this.loadedServerStatus = true;
        },
        watchAttrsUpdatedShip () {
            unsubscribeData.call(this);
            subscribeData.call(this);
        }
    }
}

const createDelayedUpdater = function () {
    this.serverStatusData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedShip.bind(this), 10);
    this.serverStatusData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.serverStatusData.delayedAttrUpdate.stop();
    delete this.serverStatusData.delayedAttrUpdate;
}

const unsubscribeData = function () {
    if(exists(this.serverStatusData.unsubscribe)) {
        this.serverStatusData.unsubscribe();
        delete this.serverStatusData.unsubscribe;
    }
}
const subscribeData = function () {
    this.loadedServerStatus = false;

    this.serverStatusData.unsubscribe = cache.tqStatus.subscribe();

    Promise.all([
        cache.tqStatus.readyPromise(),
    ])
        .then(this.onLoadedServerStatus.bind(this));
}

export default ServerStatusMixin;