<template>
  <div>
    <div class="map-menu-left-icons">
      <md-button class="md-icon-button" @click="showDialog = true">
        <md-icon>leaderboard</md-icon>
      </md-button>

      <md-button v-if="showExport" class="md-icon-button" @click="exportMap()">
        <md-icon>ios_share</md-icon>
      </md-button>
    </div>

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
  import api from '../../../../js/api';

  function saveFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(a.href);
  }

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
        showExport: false
      };
    },
    watch: {
      async mapId () {
        this.lMapId = this.mapId;

        const isOwner = await api.eve.map.exportMap(this.mapId, true);
        this.showExport = isOwner;
      }
    },
    methods: {
      async exportMap () {
        const result = await api.eve.map.exportMap(this.mapId);
        saveFile(JSON.stringify(result), 'mapdata.json', "text/plain")
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

  .map-menu-left-icons {
    display: flex;
    gap: 4px;
    align-items: center;
  }
</style>
