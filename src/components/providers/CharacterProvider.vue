<template>
  <!--  <div>{{ effectLoaded }}</div>-->
  <div class="wd-character-provider">
    <slot
      :loaded="characterInfoLoaded"
      :data="{
            allianceId: lAllianceId,
            allianceName,
            allianceTicker,
            corporationId: lCorporationId,
            corporationName,
            corporationTicker,
            characterName
      }" />
  </div>
</template>

<script>
  import CharacterPublicInfoMixin from '../mixins/character/publicInfo';
  import CorporationPublicInfoMixin from '../mixins/corporation/publicInfo';
  import AlliancePublicInfoMixin from '../mixins/alliance/publicInfo';
  import { CharacterInfoHelperMixin } from '../mixins/characterInfoHelper';

  export default {
    name: 'CharacterProvider',
    mixins: [
      CharacterPublicInfoMixin,
      CorporationPublicInfoMixin,
      AlliancePublicInfoMixin,
      CharacterInfoHelperMixin,
    ],
    computed: {
      effectLoaded () {
        if (this.characterInfoLoaded) {
          this.$emit('loaded', {
            allianceId: this.lAllianceId,
            allianceName: this.allianceName,
            allianceTicker: this.allianceTicker,
            corporationId: this.lCorporationId,
            corporationName: this.corporationName,
            corporationTicker: this.corporationTicker,
            characterName: this.characterName,
          });
        }
        return null;
      },
    },
  };
</script>

<style scoped>

</style>