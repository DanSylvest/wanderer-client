import SpamFilter from '../../js/env/spamFilter.js';
import exists from '../../js/env/tools/exists.js';
import cache from '../../js/cache/cache.js';

const SolarSystemMixin = {
  props: {
    solarSystemId: {
      type: String,
      default: null,
    },
    mapId: {
      type: String,
      default: null,
    },
    existsOnMap: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      lExistsOnMap: this.existsOnMap,
      loadedSolarSystem: false,
      lSolarSystemId: this.solarSystemId,
      lMapId: this.mapId,
    };
  },
  watch: {
    existsOnMap (val) {
      this.lExistsOnMap = val;
    },
    solarSystemId (val) {
      this.lSolarSystemId = val;
      this.ssData.delayedAttrUpdate.call();
    },
    mapId (val) {
      this.lMapId = val;
      this.ssData.delayedAttrUpdate.call();
    },
  },
  mounted () {
    this.ssData = Object.create(null);
    createDelayedUpdater.call(this);
  },
  beforeDestroy () {
    unsubscribeData.call(this);
    destroyDelayedUpdater.call(this);
    delete this.ssData;
  },
  computed: {
    description () {
      return this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].description;
    },
    userName () {
      return this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].userName;
    },
    signatures () {
      return this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].signatures;
    },
  },
  methods: {
    onLoadedSolarSystem () {
      this.loadedSolarSystem = true;
    },
    watchAttrsUpdatedSolarSystem () {
      if (isValidAttrs.call(this)) {
        unsubscribeData.call(this);
        subscribeData.call(this);
      }
    },
  },
};

const createDelayedUpdater = function () {
  this.ssData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedSolarSystem.bind(this), 10);
  isValidAttrs.call(this) && this.ssData.delayedAttrUpdate.call();
};

const destroyDelayedUpdater = function () {
  this.ssData.delayedAttrUpdate.stop();
  delete this.ssData.delayedAttrUpdate;
};

const isValidAttrs = function () {
  let valid = exists(this.lSolarSystemId) && this.lSolarSystemId !== '';

  if (valid && this.lExistsOnMap) {
    valid = exists(this.lMapId) && this.lMapId !== '';
  }

  return valid;
};

const unsubscribeData = function () {
  if (exists(this.ssData.staticDataUnsubscribe)) {
    this.ssData.staticDataUnsubscribe();
    delete this.ssData.staticDataUnsubscribe;
  }

  if (this.lExistsOnMap && exists(this.ssData.dynamicDataUnsubscribe)) {
    this.ssData.dynamicDataUnsubscribe();
    delete this.ssData.dynamicDataUnsubscribe;
  }
};
const subscribeData = function () {
  this.loadedSolarSystem = false;

  this.ssData.staticDataUnsubscribe = cache.solarSystems.list.get(this.lSolarSystemId).subscribe();

  if (this.lExistsOnMap) {
    this.ssData.dynamicDataUnsubscribe =
      cache.maps.list.get(this.lMapId).solarSystems.list.get(this.lSolarSystemId).subscribe();
  }

  Promise.all([
    cache.solarSystems.list.get(this.lSolarSystemId).readyPromise(),
    this.lExistsOnMap && cache.maps.list.get(this.lMapId).solarSystems.list.get(this.lSolarSystemId).readyPromise(),
  ])
    .then(this.onLoadedSolarSystem.bind(this));
};

export default SolarSystemMixin;