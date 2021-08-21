import CharacterPublicInfoMixin from "./character/publicInfo";

export const CharacterInfoHelperMixin = {
    computed: {
        characterInfoLoaded () {
            return this.loadedCharacter && this.loadedAlliance && this.loadedCorporation;
        }
    },
    methods: {
        _onLoadedCharacter() {
            CharacterPublicInfoMixin.methods._onLoadedCharacter.call(this);

            if (this.characterPublicInfo.corporationId) {
                this.touchCorpPublicInfo(this.characterPublicInfo.corporationId);
            }

            if (this.characterPublicInfo.allianceId) {
                this.touchAllyPublicInfo(this.characterPublicInfo.allianceId);
            }
        }
    }
}
