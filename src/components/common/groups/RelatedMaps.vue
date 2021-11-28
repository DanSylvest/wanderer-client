<template>
  <div class="wd fs flex">
    <transition name="fade">
      <wd-table
        v-if="showTable"
        :rows="relatedMaps"
        class="padding-primary wd-cell-padding-primary no-cell-hover text-centering nowrap-cells"
      >
        <template v-slot:toolbar>
          <div class="md-toolbar-section-start">
            Bounded maps
          </div>
        </template>

        <template v-slot:header>
          <table-header-cell id="name">Name</table-header-cell>
          <table-header-cell id="description" width-policy="1fr">Description</table-header-cell>
          <table-header-cell sortable id="buttons"></table-header-cell>
        </template>

        <template v-slot:row="{row}">
          <table-cell id="name" class="wd padding-vertical-small table-text">{{ row.name }}</table-cell>
          <table-cell id="description" class="wd padding-horizontal-primary table-text">{{ row.description }}</table-cell>
          <table-cell class="wd-list-margins-x1 table-text">
            <div class="wd-icon-button" @click="shareMap(row.id)">
              <md-tooltip>Copy map link</md-tooltip>
              <md-icon>content_copy</md-icon>
            </div>

            <div class="wd-icon-button" @click="openMap(row.id)">
              <md-tooltip>Open this map</md-tooltip>
              <md-icon>open_in_new</md-icon>
            </div>
          </table-cell>
        </template>
      </wd-table>
    </transition>

    <transition name="fade">
      <md-empty-state
        v-if="showEmptyState"
        md-icon="link_off"
        md-label="No map is linked"
        md-description="That's means this groups is not added into any map."
      />
    </transition>
  </div>
</template>

<script>
  import RelatedMapsByGroupMixin from '../../mixins/relatedMaps.js';
  import WdTable from '../../ui/Table/WdTable.vue';
  import TableCell from '../../ui/Table/TableCell.vue';
  import TableHeaderCell from '../../ui/Table/TableHeaderCell.vue';
  import copyToClipboard from '../../../js/env/copyToClipboard.js';
  import helper from '../../../js/utils/helper.js';

  export default {
    name: 'RelatedMaps',
    mixins: [RelatedMapsByGroupMixin],
    components: { WdTable, TableCell, TableHeaderCell },
    computed: {
      showTable () {
        return this.loadedRM && this.relatedMaps.length > 0;
      },
      showEmptyState () {
        return this.loadedRM && this.relatedMaps.length === 0;
      },
    },
    methods: {
      openMap (mapId) {
        window.open(`?page=home&item=currentMap&id=${ mapId }`);
      },
      shareMap (mapId) {
        copyToClipboard(`?page=home&item=currentMap&id=${ mapId }`);

        helper.infoMessage(this, 'Map link has been successful copied to clipboard');
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "src/css/variables";

  .table-text {
    font-size: $font-size-medium-small;
    color: $fg-primary-1;
  }
</style>