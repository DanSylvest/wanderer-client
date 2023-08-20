<template>
  <div> {{ emitter1 }}</div>
</template>

<script>
  import { UserCharactersMixin } from '@/components/common/CurrentMap/UserCharacters/mixins/userCharacters';
  import { OnlineCharactersMixin } from '@/components/common/CurrentMap/SolarSystem/mixins/onlineCharacters';

  export default {
    name: 'UserCharactersProvider',
    mixins: [
      UserCharactersMixin,
      OnlineCharactersMixin,
    ],
    computed: {
      charactersData () {
        if (!this.loadedUserCharacters || !this.loadedOnlineCharacters) {
          return null;
        }

        const userCharactersList = this.userCharactersList;
        const onlineCharactersList = this.onlineCharactersList;

        return { userCharactersList, onlineCharactersList };
      },
      emitter1 () {
        if (!this.charactersData) {
          return null;
        }

        this.$emit('onCharactersData', this.charactersData);
        return null;
      },
    },
  };
</script>

<style scoped>

</style>