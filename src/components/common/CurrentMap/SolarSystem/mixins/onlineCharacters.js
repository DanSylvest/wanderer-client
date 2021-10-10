import SpamFilter from '../../../../../js/env/spamFilter.js';
import exists from '../../../../../js/env/tools/exists.js';
import cache from '../../../../../js/cache/cache.js';

export const OnlineCharactersMixin = {
  props: {
    mapId: {
      type: String,
      default: null,
    },
  },
  data: function () {
    return {
      mapId_: this.mapId,
      loadedOnlineCharacters: false,
    };
  },
  watch: {
    mapId (val) {
      this.mapId_ = val;
      this.onlineCharactersData.delayedAttrUpdate.call();
    },
  },
  mounted () {
    this.onlineCharactersData = Object.create(null);
    createDelayedUpdater.call(this);
  },
  beforeDestroy () {
    unsubscribeData.call(this);
    destroyDelayedUpdater.call(this);
    delete this.onlineCharactersData;
  },
  computed: {
    /**
     *
     * @returns {Array.<{characterId: string, locationId: string, shipTypeId: number}>}
     */
    onlineCharactersList () {
      return this.loadedOnlineCharacters ? this.$store.state.maps[this.mapId_].onlineCharacters.value : [];
    },
  },
  methods: {
    _onLoadedOnlineCharacters () {
      this.loadedOnlineCharacters = true;
    },
  },
};

const createDelayedUpdater = function () {
  this.onlineCharactersData.delayedAttrUpdate = new SpamFilter(watchAttrsUpdated.bind(this), 10);
  isValidAttrs.call(this) && this.onlineCharactersData.delayedAttrUpdate.call();
};

const destroyDelayedUpdater = function () {
  this.onlineCharactersData.delayedAttrUpdate.stop();
  delete this.onlineCharactersData.delayedAttrUpdate;
};

const isValidAttrs = function () {
  return exists(this.mapId_) && this.mapId_ !== '';
};

const watchAttrsUpdated = function () {
  if (isValidAttrs.call(this)) {
    unsubscribeData.call(this);
    subscribeData.call(this);
  }
};

const unsubscribeData = function () {
  if (exists(this.onlineCharactersData.unsubscriberOnlineCharacters)) {
    this.onlineCharactersData.unsubscriberOnlineCharacters();
    delete this.onlineCharactersData.unsubscriberOnlineCharacters;
  }
};

const subscribeData = function () {
  this.loadedOnlineCharacters = false;

  const onlineCharacters = cache.maps.list.get(this.mapId_).onlineCharacters;
  this.onlineCharactersData.unsubscriberOnlineCharacters = onlineCharacters.subscribe();
  onlineCharacters.readyPromise().then(this._onLoadedOnlineCharacters.bind(this));
};

