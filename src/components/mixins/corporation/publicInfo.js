import SpamFilter from '../../../js/env/spamFilter.js';
import exists from '../../../js/env/tools/exists.js';
import cache from '../../../js/cache/cache.js';

const CorporationPublicInfoMixin = {
  props: {
    corporationId: {
      type: String,
      default: null,
    },
  },
  data: function () {
    return {
      lCorporationId: this.corporationId,
      loadedCorporation: false,
    };
  },
  watch: {
    corporationId (val) {
      this.lCorporationId = val;
      this.crppiData.delayedAttrUpdate.call();
    },
  },
  mounted () {
    this.crppiData = Object.create(null);
    createDelayedUpdater.call(this);
  },
  beforeUnmount () {
    unsubscribeData.call(this);
    destroyDelayedUpdater.call(this);
    delete this.crppiData;
  },
  computed: {
    corporationPublicInfo () {
      if (!this.loadedCorporation) {
        return null;
      }

      if (!this.$store.state.corporations[this.lCorporationId]) {
        return null;
      }

      return this.$store.state.corporations[this.lCorporationId].publicInfo;
    },
    corporationName () {
      return this.corporationPublicInfo && this.corporationPublicInfo.name;
    },
    corporationTicker () {
      return this.corporationPublicInfo && this.corporationPublicInfo.ticker;
    },

  },
  methods: {
    _onLoadedCorporation () {
      this.loadedCorporation = true;
    },
    touchCorpPublicInfo (corporationId) {
      this.loadedCorporation = false;
      this.lCorporationId = corporationId;
      this.crppiData.delayedAttrUpdate.call();
    },
  },
};

const createDelayedUpdater = function () {
  this.crppiData.delayedAttrUpdate = new SpamFilter(watchAttrsUpdated.bind(this), 10);
  isValidAttrs.call(this) && this.crppiData.delayedAttrUpdate.call();
};

const destroyDelayedUpdater = function () {
  this.crppiData.delayedAttrUpdate.stop();
  delete this.crppiData.delayedAttrUpdate;
};

const isValidAttrs = function () {
  return exists(this.lCorporationId) && this.lCorporationId !== '';
};

const watchAttrsUpdated = function () {
  if (isValidAttrs.call(this)) {
    unsubscribeData.call(this);
    subscribeData.call(this);
  }
};

const unsubscribeData = function () {
  if (exists(this.crppiData.unsubscriberPublicInfo)) {
    this.crppiData.unsubscriberPublicInfo();
    delete this.crppiData.unsubscriberPublicInfo;
  }
};

const subscribeData = function () {
  this.loadedCorporation = false;
  const publicInfo = cache.corporations.list.get(this.lCorporationId).publicInfo;
  this.crppiData.unsubscriberPublicInfo = publicInfo.subscribe();
  publicInfo.readyPromise().then(this._onLoadedCorporation.bind(this));
};

export default CorporationPublicInfoMixin;