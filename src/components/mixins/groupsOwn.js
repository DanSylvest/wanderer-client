import SpamFilter from "../../js/env/spamFilter.js";
import api from "../../js/api.js";
import helper from "../../js/utils/helper.js";

const GroupsOwnMixin = {
    data: function () {
        return {
            loadedGroupsOwn: false,
            groupsOwnList: []
        }
    },
    mounted () {
        this.groupsOwnData = Object.create(null);
        createDelayedUpdater.call(this);
    },
    beforeDestroy() {
        destroyDelayedUpdater.call(this);
        delete this.groupsOwnData;
    },
    computed : {},
    methods: {
        onLoadedGroupsOwn (data) {
            this.loadedGroupsOwn = true;
            this.groupsOwnList = data;
        },
        watchAttrsUpdatedGroupsOwn () {
            subscribeData.call(this);
        }
    }
}

const createDelayedUpdater = function () {
    this.groupsOwnData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedGroupsOwn.bind(this), 10);
    this.groupsOwnData.delayedAttrUpdate.call();
}

const destroyDelayedUpdater = function () {
    this.groupsOwnData.delayedAttrUpdate.stop();
    delete this.groupsOwnData.delayedAttrUpdate;
}

const subscribeData = function () {
    this.loadedGroupsOwn = false;

    api.eve.group.list()
        .then(
            data => this.onLoadedGroupsOwn(data),
            err => helper.errorHandler(this, err)
        );
}

export default GroupsOwnMixin;