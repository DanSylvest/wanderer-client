import SpamFilter from '../../../js/env/spamFilter.js';
import exists from '../../../js/env/tools/exists.js';
import cache from '../../../js/cache/cache.js';
import CustomPromise from '../../../js/env/promise';

const CharacterPublicInfoMixin = {
  props: {
    characterId: {
      type: String,
      default: null,
    },
  },
  data: function () {
    return {
      lCharacterId: this.characterId,
      loadedCharacter: false,
    };
  },
  watch: {
    characterId (val) {
      this.lCharacterId = val;
      this.loadedCharacter = false;
      this.cpiData.delayedAttrUpdate.call();
    },
  },
  mounted () {
    this.cpiData = Object.create(null);
    createDelayedUpdater.call(this);
  },
  beforeDestroy () {
    unsubscribeData.call(this);
    destroyDelayedUpdater.call(this);
    delete this.cpiData;
  },
  computed: {
    characterPublicInfo () {
      if (!this.loadedCharacter) {
        return null;
      }

      return this.$store.state.characters[this.lCharacterId].publicInfo;
    },
    characterName () {
      if (!this.loadedCharacter) {
        return null;
      }

      return this.characterPublicInfo.name;
    },
    hasAlliance () {
      if (!this.loadedCharacter) {
        return false;
      }

      return !!this.characterPublicInfo.allianceId;
    },
    hasCorporation () {
      if (!this.loadedCharacter) {
        return false;
      }

      return !!this.characterPublicInfo.corporationId;
    },
  },
  methods: {
    _onLoadedCharacter () {
      this.loadedCharacter = true;
    },
  },
};

const createDelayedUpdater = function () {
  this.cpiData.delayedAttrUpdate = new SpamFilter(watchAttrsUpdated.bind(this), 10);
  isValidAttrs.call(this) && this.cpiData.delayedAttrUpdate.call();
};

const destroyDelayedUpdater = function () {
  this.cpiData.delayedAttrUpdate.stop();
  delete this.cpiData.delayedAttrUpdate;
};

const isValidAttrs = function () {
  return exists(this.lCharacterId) && this.lCharacterId !== '';
};

const watchAttrsUpdated = function () {
  if (isValidAttrs.call(this)) {
    unsubscribeData.call(this);
    subscribeData.call(this);
  }
};

const unsubscribeData = function () {
  if (exists(this.cpiData.unsubscriberPublicInfo)) {
    this.cpiData.unsubscriberPublicInfo();
    delete this.cpiData.unsubscriberPublicInfo;
  }

  if (this.cpiData.readyPromise) {
    this.cpiData.readyPromise.native.cancel();
    delete this.cpiData.readyPromise;
  }
};

const subscribeData = function () {
  this.loadedCharacter = false;
  const publicInfo = cache.characters.list.get(this.lCharacterId).publicInfo;
  this.cpiData.unsubscriberPublicInfo = publicInfo.subscribe();
  this.cpiData.readyPromise = new CustomPromise(publicInfo.readyPromise());
  this.cpiData.readyPromise.native.then(this._onLoadedCharacter.bind(this));
};

export default CharacterPublicInfoMixin;