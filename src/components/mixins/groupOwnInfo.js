import SpamFilter from "../../js/env/spamFilter.js";
import api from "../../js/api.js";
import helper from "../../js/utils/helper.js";
import exists from "../../js/env/tools/exists.js";

const GroupOwnInfoMixin = {
    props: {
        groupId: {
            type: String,
            default: null
        }
    },
    data: function () {
        return {
            loadedGroupOwnInfo: false,
            lGroupId: this.groupId,
            groupOwnInfo: null
        }
    },
    mounted () {
        this.groupOwnInfoData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeDestroy() {
        destroyDelayedUpdater.call(this);
        delete this.groupOwnInfoData;
    },
    watch: {
        groupId (val) {
            this.lGroupId = val;
            this.groupOwnInfoData.delayedAttrUpdate.call();
        }
    },
    computed : {},
    methods: {
        callUpdate() {
            this.groupOwnInfoData.delayedAttrUpdate.call();
        },
        onLoadedGroupOwnInfo (data) {
            this.loadedGroupOwnInfo = true;
            this.groupOwnInfo = data;
        },
        watchAttrsUpdatedGroupOwnInfo () {
            if(exists(this.lGroupId) && this.lGroupId !== "") {
                subscribeData.call(this);
            }
        }
    }
}

const createDelayedUpdater = function () {
    this.groupOwnInfoData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedGroupOwnInfo.bind(this), 10);
    this.lGroupId !== null && this.groupOwnInfoData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.groupOwnInfoData.delayedAttrUpdate.stop();
    delete this.groupOwnInfoData.delayedAttrUpdate;
}

const subscribeData = function () {
    this.loadedGroupOwnInfo = false;

    api.eve.group.getOwnInfo(this.lGroupId)
        .then(
            data => this.onLoadedGroupOwnInfo(data),
            err => helper.errorHandler(this, err)
        );
}

export default GroupOwnInfoMixin;