import SpamFilter from '../../../js/env/spamFilter.js';
import exists from '../../../js/env/tools/exists.js';
import cache from '../../../js/cache/cache.js';

const AlliancePublicInfoMixin = {
  props: {
    allianceId: {
      type: String,
      default: null,
    },
  },
  data: function () {
    return {
      lAllianceId: this.allianceId,
      loadedAlliance: false,
    };
  },
  watch: {
    allianceId (val) {
      this.lAllianceId = val;
      this.allypiData.delayedAttrUpdate.call();
    },
  },
  mounted () {
    this.allypiData = Object.create(null);
    createDelayedUpdater.call(this);
  },
  beforeUnmount () {
    unsubscribeData.call(this);
    destroyDelayedUpdater.call(this);
    delete this.allypiData;
  },
  computed: {
    alliancePublicInfo () {
      if (!this.loadedAlliance) {
        return null;
      }

      return this.$store.state.alliances[this.lAllianceId].publicInfo;
    },
    allianceTicker () {
      return this.alliancePublicInfo && this.alliancePublicInfo.ticker;
    },
    allianceName () {
      return this.alliancePublicInfo && this.alliancePublicInfo.name;
    },

  },
  methods: {
    _onLoadedAlliance () {
      this.loadedAlliance = true;
    },
    touchAllyPublicInfo (allianceId) {
      this.loadedAlliance = false;
      this.lAllianceId = allianceId;
      this.allypiData.delayedAttrUpdate.call();
    },
  },
};

const createDelayedUpdater = function () {
  this.allypiData.delayedAttrUpdate = new SpamFilter(watchAttrsUpdated.bind(this), 10);
  isValidAttrs.call(this) && this.allypiData.delayedAttrUpdate.call();
};

const destroyDelayedUpdater = function () {
  this.allypiData.delayedAttrUpdate.stop();
  delete this.allypiData.delayedAttrUpdate;
};

const isValidAttrs = function () {
  return exists(this.lAllianceId) && this.lAllianceId !== '';
};

const watchAttrsUpdated = function () {
  if (isValidAttrs.call(this)) {
    unsubscribeData.call(this);
    subscribeData.call(this);
  }
};

const unsubscribeData = function () {
  if (exists(this.allypiData.unsubscriberPublicInfo)) {
    this.allypiData.unsubscriberPublicInfo();
    delete this.allypiData.unsubscriberPublicInfo;
  }
};

const subscribeData = function () {
  this.loadedAlliance = false;
  const publicInfo = cache.alliances.list.get(this.lAllianceId).publicInfo;
  this.allypiData.unsubscriberPublicInfo = publicInfo.subscribe();
  publicInfo.readyPromise().then(this._onLoadedAlliance.bind(this));
};

export default AlliancePublicInfoMixin;