<template>
  <div class="wd-user-characters">
    <div
      class="wd-characters-icons wd-bg-default"
      :class="{'character-online': item.online}"
      v-for="item in userCharactersList"
      :style="getCharImageUrlStyle(item.charId)"
      :key="item.charId"
      @click="handleIconClick(item)"
    >
      <tooltip
        placement="bottom"
        :customPosition="false"
        :delay="1000"
        class="wd wd-layout-secondary md-elevation-2"
      >
        <character-card :map-id="mapId_" :character-id="item.charId" />
      </tooltip>
    </div>
  </div>
</template>

<script>
  import Tooltip from '../../../ui/Tooltip';
  import CharacterCard from '../CharacterCard';
  import { UserCharactersMixin } from './mixins/userCharacters';
  import { getCharImageUrlStyle } from '../../../utils/eveResources';

  export default {
    name: 'UserCharacters',
    components: { Tooltip, CharacterCard },
    mixins: [UserCharactersMixin],
    methods: {
      getCharImageUrlStyle,
      handleIconClick ({ charId }) {
        this.$emit('click', { charId });
      },
    },
  };
</script>

<style scoped lang="scss">
  .wd-user-characters {
    width: 100%;
    height: 100%;
    padding-right: 5px;

    display: flex;
    justify-content: flex-end;

    *:not(:last-child) {
      margin-right: 5px;
    }
  }
</style>