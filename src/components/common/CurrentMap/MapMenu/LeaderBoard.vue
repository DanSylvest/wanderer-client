<template>
  <wd-table :rows="leaders">
    <template v-slot:header>
      <table-header-cell alignment="start" sortable id="characterId">Name</table-header-cell>
      <table-header-cell alignment="start" sortable id="record_count" widthPolicy="110px">Passages
      </table-header-cell>
    </template>

    <template v-slot:row="{row}">
      <table-cell class="character-cell" alignment="start" id="characterId">
        <character-search-item :character-id="row.characterId.toString()" />
      </table-cell>
      <table-cell id="record_count">{{ row.record_count }}</table-cell>
    </template>

    <template v-slot:empty-state>
      <md-empty-state
        md-icon="announcement"
        md-label="Nothing to show here"
        md-description=""
      >
      </md-empty-state>
    </template>
  </wd-table>
</template>

<script>
  import WdTable from '@/components/ui/Table/WdTable';
  import TableCell from '@/components/ui/Table/TableCell';
  import TableHeaderCell from '@/components/ui/Table/TableHeaderCell';
  import CharacterSearchItem from '@/components/common/Searcher/SearchItem/CharacterSearchItem';
  import api from '@/js/api';

  export default {
    name: 'LeaderBoard',
    props: {
      mapId: {
        type: String,
        default: null,
      },
    },
    components: {
      WdTable,
      TableCell,
      TableHeaderCell,
      CharacterSearchItem,
    },
    data: function () {
      return {
        showDialog: false,
        lMapId: this.mapId,
        leaders: [],
      };
    },
    watch: {
      async mapId () {
        await this.loadLeaders();
      },
    },
    async mounted () {
      await this.loadLeaders();
    },
    methods: {
      async loadLeaders() {
        if (this.mapId == null) {
          return;
        }

        const res = await api.eve.map.leaderboard(this.mapId);

        this.leaders = res.activity;
      }
    }
  };
</script>

<style scoped>
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