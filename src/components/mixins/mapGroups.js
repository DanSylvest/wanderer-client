import SpamFilter from "../../js/env/spamFilter.js";
import api from "../../js/api.js";
import helper from "../../js/utils/helper.js";
import exists from "../../js/env/tools/exists.js";

const MapGroupsMixin = {
    props: {
        mapId: {
            type: String,
            default: null
        }
    },
    data: function () {
        return {
            loadedMapGroups: false,
            lMapId: this.mapId,
            mapGroups: null
        }
    },
    mounted () {
        this.mapGroupsData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeUnmount() {
        destroyDelayedUpdater.call(this);
        delete this.mapGroupsData;
    },
    watch: {
        mapId (val) {
            this.lMapId = val;
            this.mapGroupsData.delayedAttrUpdate.call();
        }
    },
    computed : {},
    methods: {
        callUpdate() {
            this.mapGroupsData.delayedAttrUpdate.call();
        },
        onLoadedMapGroups (data) {
            this.loadedMapGroups = true;
            this.mapGroups = data;
        },
        watchAttrsUpdatedMapGroups () {
            if(exists(this.lMapId) && this.lMapId !== "") {
                subscribeData.call(this);
            }
        }
    }
}

const createDelayedUpdater = function () {
    this.mapGroupsData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedMapGroups.bind(this), 10);
    this.lMapId !== null && this.mapGroupsData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.mapGroupsData.delayedAttrUpdate.stop();
    delete this.mapGroupsData.delayedAttrUpdate;
}

const subscribeData = function () {
    this.loadedMapGroups = false;

    api.eve.map.groups(this.lMapId)
        .then(
            data => this.onLoadedMapGroups(data),
            err => helper.errorHandler(this, err)
        );
}

export default MapGroupsMixin;