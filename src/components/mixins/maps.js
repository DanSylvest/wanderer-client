import SpamFilter from '../../js/env/spamFilter.js';
import api from '../../js/api.js';
import helper from '../../js/utils/helper.js';

const MapsMixin = {
  data: function () {
    return {
      loadedMaps: false,
      mapsList: [],
    };
  },
  mounted () {
    this.mapsData = Object.create(null);
    createDelayedUpdater.call(this);
  },
  beforeUnmount () {
    destroyDelayedUpdater.call(this);
    delete this.mapsData;
  },
  computed: {},
  methods: {
    onLoadedMaps (data) {
      this.loadedMaps = true;
      this.mapsList = data;
    },
    watchAttrsUpdatedMaps () {
      subscribeData.call(this);
    },
  },
};

const createDelayedUpdater = function () {
  this.mapsData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedMaps.bind(this), 10);
  this.mapsData.delayedAttrUpdate.call();
};

const destroyDelayedUpdater = function () {
  this.mapsData.delayedAttrUpdate.stop();
  delete this.mapsData.delayedAttrUpdate;
};

const subscribeData = function () {
  this.loadedMaps = false;

  api.eve.map.list()
    .then(
      data => this.onLoadedMaps(data),
      err => helper.errorHandler(this, err),
    );
};

export default MapsMixin;