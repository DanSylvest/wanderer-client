import SpamFilter from "../../js/env/spamFilter.js";
import api from "../../js/api.js";
import helper from "../../js/utils/helper.js";
import exists from "../../js/env/tools/exists.js";

const GroupPublicInfoMixin = {
    props: {
        groupId: {
            type: String,
            default: null
        }
    },
    data: function () {
        return {
            loadedGroupPublicInfo: false,
            lGroupId: this.groupId,
            groupPublicInfo: null
        }
    },
    mounted () {
        this.groupPublicInfoData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeUnmount() {
        destroyDelayedUpdater.call(this);
        delete this.groupPublicInfoData;
    },
    watch: {
        groupId (val) {
            this.lGroupId = val;
            this.groupPublicInfoData.delayedAttrUpdate.call();
        }
    },
    computed : {},
    methods: {
        callUpdate() {
            this.groupPublicInfoData.delayedAttrUpdate.call();
        },
        onLoadedGroupPublicInfo (data) {
            this.loadedGroupPublicInfo = true;
            this.groupPublicInfo = data;
        },
        watchAttrsUpdatedGroupPublicInfo () {
            if(exists(this.lGroupId) && this.lGroupId !== "") {
                subscribeData.call(this);
            }
        }
    }
}

const createDelayedUpdater = function () {
    this.groupPublicInfoData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedGroupPublicInfo.bind(this), 10);
    this.lGroupId !== null && this.groupPublicInfoData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.groupPublicInfoData.delayedAttrUpdate.stop();
    delete this.groupPublicInfoData.delayedAttrUpdate;
}

const subscribeData = function () {
    this.loadedGroupPublicInfo = false;

    api.eve.group.info(this.lGroupId)
        .then(
            data => this.onLoadedGroupPublicInfo(data),
            err => helper.errorHandler(this, err)
        );
}

export default GroupPublicInfoMixin;