import SpamFilter from "../../js/env/spamFilter.js";
import exists from "../../js/env/tools/exists.js";
import api from "../../js/api.js";
import helper from "../../js/utils/helper.js";

const GroupAllowedCharactersMixin = {
    props: {
        groupId: {
            type: String,
            default: null
        }
    },
    data: function () {
        return {
            loadedGroupAC: false,
            lGroupId: this.groupId,
            allowedCharacters: []
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
    beforeUnmount() {
        // unsubscribeData.call(this);
        destroyDelayedUpdater.call(this);
        delete this.groupData;
    },
    computed : {

    },
    methods: {
        onLoadedGroupAC (data) {
            this.loadedGroupAC = true;
            this.allowedCharacters = data;
        },
        watchAttrsUpdatedGroupAC () {
            if(isValidAttrs.call(this)) {
                subscribeData.call(this);
            }
        }
    }
}

const createDelayedUpdater = function () {
    this.groupData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedGroupAC.bind(this), 10);
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
    this.loadedGroupAC = false;

    api.eve.group.getAllowedCharacters(this.lGroupId)
        .then(
            data => this.onLoadedGroupAC(data),
            err => helper.errorHandler(this, err)
        );
}

export default GroupAllowedCharactersMixin;