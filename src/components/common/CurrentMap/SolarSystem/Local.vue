<template>
  <div class="solar-system-local">
    <local-character v-for="{characterId, isOwn, shipTypeId} in systemLocal"
                     :key="characterId"
                     :map-id="mapId_"
                     :character-id="characterId"
                     :ship-type-id="shipTypeId"
                     :is-own="isOwn" />
  </div>
</template>

<script>
  import LocalCharacter from './LocalCharacter.vue';
  import SolarSystemMixin from '../../../mixins/solarSystem.js';
  import { UserCharactersMixin } from '../UserCharacters/mixins/userCharacters';
  import { OnlineCharactersMixin } from './mixins/onlineCharacters';


  export default {
    name: 'Local',
    components: { LocalCharacter },
    mixins: [
      SolarSystemMixin,
      UserCharactersMixin,
      OnlineCharactersMixin,
    ],
    computed: {
      /**
       *
       * @returns {{isOwn: boolean, shipTypeId: number, locationId: string, characterId: string}[]|*[]}
       */
      systemLocal () {
        if (!this.loadedUserCharacters || !this.loadedOnlineCharacters) {
          return [];
        }

        const onlineUserCharacters = this.userCharactersList.filter(({ online }) => online);

        return this.onlineCharactersList
          .filter(({ locationId }) => locationId === this.solarSystemId)
          .map(({ characterId, shipTypeId }) => ({
            characterId,
            shipTypeId,
            isOwn: !!onlineUserCharacters.search('charId', characterId),
          }))
          .sort((a, b) => b.isOwn - a.isOwn);
      },

    },
  };
</script>

<style lang="scss">
  @import "/src/css/variables";
  @import "~vue-material/dist/theme/engine";

</style>