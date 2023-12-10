import SpamFilter from '../../js/env/spamFilter.js';
import api from '../../js/api.js';
import helper from '../../js/utils/helper.js';
import exists from '../../js/env/tools/exists.js';

const MapInfoMixin = {
  props: {
    mapId: {
      type: String,
      default: null,
    },
  },
  data: function () {
    return {
      loadedMapInfo: false,
      lMapId: this.mapId,
      mapInfo: null,
    };
  },
  mounted () {
    this.mapInfoData = Object.create(null);
    createDelayedUpdater.call(this);
  },
  beforeUnmount () {
    destroyDelayedUpdater.call(this);
    delete this.mapInfoData;
  },
  watch: {
    mapId (val) {
      this.lMapId = val;
      this.mapInfoData.delayedAttrUpdate.call();
    },
  },
  computed: {
    mapName () {
      return this.mapInfo && this.mapInfo.name;
    },
    mapDescription () {
      return this.mapInfo && this.mapInfo.description;
    },
    mapNote () {
      return this.mapInfo && this.mapInfo.note;
    },
  },
  methods: {
    callUpdate () {
      this.mapInfoData.delayedAttrUpdate.call();
    },
    onLoadedMapInfo (data) {
      this.loadedMapInfo = true;
      this.mapInfo = data;
    },
    watchAttrsUpdatedMapInfo () {
      if (exists(this.lMapId) && this.lMapId !== '') {
        subscribeData.call(this);
      }
    },
  },
};

const createDelayedUpdater = function () {
  this.mapInfoData.delayedAttrUpdate = new SpamFilter(this.watchAttrsUpdatedMapInfo.bind(this), 10);
  this.lMapId !== null && this.mapInfoData.delayedAttrUpdate.call();
};

const destroyDelayedUpdater = function () {
  this.mapInfoData.delayedAttrUpdate.stop();
  delete this.mapInfoData.delayedAttrUpdate;
};

const subscribeData = function () {
  this.loadedMapInfo = false;

  api.eve.map.info(this.lMapId)
    .then(
      data => this.onLoadedMapInfo(data),
      err => helper.errorHandler(this, err),
    );
};

export default MapInfoMixin;