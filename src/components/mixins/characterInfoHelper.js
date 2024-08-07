import CharacterPublicInfoMixin from './character/publicInfo';

export const CharacterInfoHelperMixin = {
  // watch: {
  //   characterId () {
  //     CharacterPublicInfoMixin.watch.characterId.call(this);
  //     // this.lCorporationId = null;
  //     // this.lAllianceId = null;
  //     // this.loadedAlliance = false;
  //     // this.loadedCorporation = false;
  //   },
  // },
  computed: {
    characterInfoLoaded () {
      if (!this.loadedCharacter) {
        return false;
      }

      if (this.characterPublicInfo.corporationId && !this.loadedCorporation) {
        return false;
      }

      return !(this.characterPublicInfo.allianceId && !this.loadedAlliance);
    },
  },
  methods: {
    _onLoadedCharacter () {
      CharacterPublicInfoMixin.methods._onLoadedCharacter.call(this);

      if (this.characterPublicInfo.corporationId) {
        this.touchCorpPublicInfo(this.characterPublicInfo.corporationId);
      }

      if (this.characterPublicInfo.allianceId) {
        this.touchAllyPublicInfo(this.characterPublicInfo.allianceId);
      }
    },
  },
};
