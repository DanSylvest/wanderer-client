<template>
  <div>
    <md-button class="md-icon-button" @click="showDialog = true">
      <md-icon>leaderboard</md-icon>
    </md-button>

    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Activity of characters of current map</md-dialog-title>

      <div class="lb-content" style="width: 500px; height: 50vh">
        <leader-board :map-id="lMapId" />
      </div>

      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
  import LeaderBoard from '@/components/common/CurrentMap/MapMenu/LeaderBoard';

  export default {
    name: 'MapMenu',
    props: {
      mapId: {
        type: String,
        default: null,
      },
    },
    components: {
      LeaderBoard,
    },
    data: function () {
      return {
        lMapId: this.mapId,
        showDialog: false,
      };
    },
    watch: {
      mapId () {
        this.lMapId = this.mapId;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .md-dialog /deep/ .md-dialog-container {
    max-width: 768px;
  }

  .lb-content {
    padding: 0 20px;
  }

  .character-cell {
    padding-left: 10px;
  }
</style>