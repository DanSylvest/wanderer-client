<template>
  <div class="wd-groups wd fs">
    <transition name="fade">
      <div v-if="loaded" class="wd-allowed-groups wd fs" :class="{opened: dialogActive}">
        <wd-table
          class="wd-allowed-groups-table wd padding-primary text-centering"
          :rows="groups"
          @row-clicked="onClicked"
          :active-rows="activeRows"
        >
          <template v-slot:toolbar>
            <div class="md-toolbar-section-start">
              Groups you have access to
            </div>
          </template>

          <template v-slot:header>
            <table-header-cell sortable id="name">Name</table-header-cell>
            <table-header-cell sortable id="description">Description</table-header-cell>
          </template>

          <template v-slot:row="{row}">
            <table-cell id="name" class="table-text">{{ row.name }}</table-cell>
            <table-cell id="description" class="table-text">{{ row.description }}</table-cell>
          </template>
        </wd-table>

        <div class="wd-allowed-groups-info wd fs">
          <transition name="fade">
            <div v-if="showDialog" class="wd-wgi-container wd fs">
              <allowed-group-characters :group-id="groupId" />
              <related-maps :group-id="groupId" />
            </div>
          </transition>

          <transition name="fade">
            <md-empty-state
              v-if="showEmptyState"
              md-icon="group"
              md-label="Group isn't selected"
              md-description="Select a group - in order to see the characters with access."
            />
          </transition>
        </div>

      </div>
    </transition>
  </div>
</template>

<script>
  import api from '../../js/api.js';
  import helper from '../../js/utils/helper.js';
  import exists from '../../js/env/tools/exists.js';
  import WdTable from '../ui/Table/WdTable.vue';
  import TableCell from '../ui/Table/TableCell.vue';
  import TableHeaderCell from '../ui/Table/TableHeaderCell.vue';
  import AllowedGroupCharacters from './groups/AllowedGroupCharacters.vue';
  import RelatedMaps from './groups/RelatedMaps.vue';

  const TRANSITION_TIMEOUT = 150;

  export default {
    name: 'Groups',
    components: { RelatedMaps, WdTable, TableCell, TableHeaderCell, AllowedGroupCharacters },
    props: [],
    data: function () {
      return {
        groupId: null,
        groups: [],
        dialogActive: false,
        dialogLoading: false,
        loaded: false,
        activeRows: [],
      };
    },
    mounted: function () {
      api.eve.group.allowedGroups()
        .then(
          data => {
            this.groups = data;
            this.loaded = true;
          },
          err => helper.errorHandler(this, err),
        );
    },
    computed: {
      showDialog () {
        return !this.dialogLoading && this.dialogActive;
      },
      showEmptyState () {
        return !this.dialogLoading && !this.dialogActive;
      },
      showLoading () {
        return this.dialogLoading && !this.dialogActive;
      },
    },
    beforeDestroy () {
      exists(this._loadingTimeout) && clearTimeout(this._loadingTimeout);
      this._loadingTimeout = null;
    },
    methods: {
      onClicked (event) {
        if (this.groupId === event.data.id)
          return;

        this.activeRows = [this.groups.searchByObjectKey('id', event.data.id)];

        if (this.dialogActive && !this.dialogLoading) {
          this.dialogActive = false;
          this.dialogLoading = true;

          this._loadingTimeout = setTimeout(() => this.updateDialog(event), TRANSITION_TIMEOUT);
        } else {
          this.updateDialog(event);
        }
      },
      updateDialog (event) {
        exists(this._loadingTimeout) && clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;

        this.groupId = event.data.id;
        this.dialogLoading = false;
        this.dialogActive = true;
      },
    },
  };
</script>

<style lang="scss">
  @import "./src/css/variables";

  $characters-width: 400;
  $threshold: 850;

  .table-text {
    font-size: $font-size-medium-small;
    color: $fg-primary-1;
  }

  .wd-allowed-groups {
    display: flex;
    width: 100%;

    .wd-allowed-groups-info {
      transition: width 350ms, height 350ms;
      background-color: $bg-secondary;
      width: 100%;
      height: 100%;


      .wd-wgi-container {
        display: grid;
        grid-template-rows: 50% 50%;

        & > .wd-allowed-dialog {
          border-bottom: 1px solid $border-color-primary-5-2;
        }
      }
    }

    .wd-allowed-groups-table {
      transition: width 350ms, height 350ms;
      width: 100%;
      height: 100%;
    }

    @media screen and (max-width: #{$threshold}px) {
      flex-direction: column;
      .wd-allowed-groups-table {
        height: 30%;
      }

      .wd-allowed-groups-info {
        height: 70%;
      }
    }

    @for $i from 0 through 3 {
      @media screen and (min-width: #{$threshold + 1 + 300 * $i}px) {
        .wd-allowed-groups-table {
          width: calc(100% - #{$characters-width + 150 * $i}px);
        }

        .wd-allowed-groups-info {
          width: #{$characters-width + 150 * $i}px;
        }
      }
    }

    .wd-allowed-groups-table {
      .wd-table-cell {
        padding: 0 10px;
        text-align: left;
      }
    }
  }


</style>
