import SpamFilter from "../../js/env/spamFilter.js";
import exists from "../../js/env/tools/exists.js";
import api from "../../js/api.js";
import helper from "../../js/utils/helper.js";

const RelatedMapsByGroupMixin = {
    props: {
        groupId: {
            type: String,
            default: null
        }
    },
    data: function () {
        return {
            loadedRM: false,
            lGroupId: this.groupId,
            relatedMaps: []
        }
    },
    watch: {
        groupId (val) {
            this.lGroupId = val;
            this.groupData.delayedAttrUpdate.call();
        }
    },
    mounted () {
        this.groupData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeDestroy() {
        destroyDelayedUpdater.call(this);
        delete this.groupData;
    },
    computed : {},
    methods: {
        onLoadedRM (data) {
            this.loadedRM = true;
            this.relatedMaps = data;
        },
        watchAttrsUpdatedRM () {
            if(isValidAttrs.call(this)) {
                subscribeData.call(this);
            }
        }
    }
}

const createDelayedUpdater = function () {
    this.groupData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedRM.bind(this), 10);
    isValidAttrs.call(this) && this.groupData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.groupData.delayedAttrUpdate.stop();
    delete this.groupData.delayedAttrUpdate;
}

const isValidAttrs = function () {
    return exists(this.lGroupId) && this.lGroupId !== "";
}

const subscribeData = function () {
    this.loadedRM = false;

    api.eve.group.mapsByGroup(this.lGroupId)
        .then(
            data => this.onLoadedRM(data),
            err => helper.errorHandler(this, err)
        );
}

export default RelatedMapsByGroupMixin;