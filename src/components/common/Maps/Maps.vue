<template>
  <div class="wd fs">
    <transition name="fade">
      <div class="wd fs wd-groups" v-if="showMaps">
        <div class="wd fs padding-primary wd-groups__table">
          <wd-table
            :rows="mapsList"
            @row-clicked="onRowClicked"
            @selected="selectedMaps = $event"
            selectable
            class="text-centering  wd"
            :active-rows="activeRows"
          >
            <template v-slot:toolbar>
              <div class="md-toolbar-section-start">
                Maps
              </div>

              <div class="md-toolbar-section-end">
                <md-button class="md-dense md-accent md-raised" @click="showCreateSimpleDialog = true">
                  <div class="wd f-c-sb">
                    <md-icon>library_add</md-icon>
                    <div style="width: 5px;" />
                    <span>Add map</span>
                  </div>
                </md-button>

              </div>
            </template>

            <template v-slot:alternate-toolbar>
              <div class="md-toolbar-section-start">
                Actions with selected
              </div>

              <div class="md-toolbar-section-end">
                <md-button class="md-icon-button" @click="onRemoveMaps">
                  <md-tooltip md-direction="bottom">Delete</md-tooltip>
                  <md-icon>delete</md-icon>
                </md-button>
              </div>
            </template>

            <template v-slot:header>
              <table-header-cell sortable id="name">Name</table-header-cell>
              <table-header-cell sortable id="note">Personal Note</table-header-cell>
              <table-header-cell sortable id="description">Description</table-header-cell>
            </template>

            <template v-slot:row="{row}">
              <table-cell id="name" class="wd padding-vertical-small table-text">{{ row.name }}</table-cell>
              <table-cell id="note" class="wd padding-horizontal-primary table-text">{{ row.note }}</table-cell>
              <table-cell id="description" class="wd padding-horizontal-primary table-text">{{ row.description }}
              </table-cell>
            </template>
          </wd-table>
        </div>

        <div class="wd-groups__info">
          <transition name="fade">
            <div v-if="isEditingMap" class="wd-wgi-container wd fs">
              <map-editor :map-id="selectedMapId" @success="onMapEdited" :editing="true" />
              <!--                            <related-maps :group-id="selectedGroupId" />-->
            </div>
          </transition>

          <transition name="fade">
            <md-empty-state
              v-if="!isEditingMap"
              md-icon="group"
              md-label="Map isn't selected"
              md-description="Select a map - in order to change settings."
            />
          </transition>
        </div>

      </div>
    </transition>

    <transition name="fade">
      <md-empty-state
        v-if="showEmptyMaps"
        md-icon="layers"
        md-label="Create your map!"
        md-description="Map allow track your characters also a lot of different settings allow give a access to your map."
      >
        <md-button class="md-dense md-primary md-raised" @click="showCreateSimpleDialog = true">
          <div class="wd f-c-sb">
            <md-icon>library_add</md-icon>
            <div style="width: 5px;" />
            <span>Add map</span>
          </div>
        </md-button>
      </md-empty-state>
    </transition>

    <map-create-simple-dialog v-model:show="showCreateSimpleDialog" @success="onMapCreated" />
  </div>
</template>

<script>
  import api from '../../../js/api';
  import WdTable from '../../ui/Table/WdTable.vue';
  import TableCell from '../../ui/Table/TableCell.vue';
  import TableHeaderCell from '../../ui/Table/TableHeaderCell.vue';
  import MapsMixin from '../../mixins/maps.js';
  import exists from '../../../js/env/tools/exists.js';
  import MapEditor from './MapEditor/MapEditor';
  import helper from '../../../js/utils/helper.js';
  import MapCreateSimpleDialog from './MapCreateSimpleDialog/MapCreateSimpleDialog.vue';

  const TRANSITION_TIMEOUT = 150;

  export default {
    name: 'Maps',
    components: {
      WdTable,
      TableCell,
      TableHeaderCell,
      MapEditor,
      MapCreateSimpleDialog,
    },
    mixins: [MapsMixin],
    data () {
      return {
        isEditingMap: false,
        isEditingMapLoading: false,
        selectedMapId: null,
        selectedMaps: [],
        activeRows: [],
        showCreateSimpleDialog: false,
      };
    },
    beforeUnmount () {
      exists(this._loadingTimeout) && clearTimeout(this._loadingTimeout);
      this._loadingTimeout = null;
    },
    mounted () {

    },
    computed: {
      loaded () {
        return this.loadedMaps;
      },
      hasMaps () {
        return this.mapsList.length > 0;
      },
      showMaps () {
        return this.loaded && this.hasMaps;
      },
      showEmptyMaps () {
        return this.loaded && !this.hasMaps /*true*/;
      },
    },
    methods: {
      onMapCreated (data) {
        this.mapsList.push(data);
      },
      onRowClicked (event) {
        if (this.selectedMapId === event.data.id) {
          return;
        }

        this.activeRows = [this.mapsList.searchByObjectKey('id', event.data.id)];

        if (this.isEditingMap && !this.isEditingFormLoading) {
          this.isEditingMap = false;
          this.isEditingFormLoading = true;

          this._loadingTimeout = setTimeout(() => this.updateEditingMap(event), TRANSITION_TIMEOUT);
        } else {
          this.updateEditingMap(event);
        }
      },
      onRemoveMaps () {
        Promise.all(this.selectedMaps.map(x => api.eve.map.remove(x.id)))
          .then(
            () => {
              this.selectedMaps.map(x => this.mapsList.eraseByObjectKey('id', x.id));
              if (this.selectedMaps.includes(this.selectedMapId)) {
                this.selectedMapId = null;
                this.isEditingMap = false;
                this.isEditingFormLoading = false;
              }
            },
            err => helper.errorHandler(this, err),
          );
      },
      onMapEdited ({ name, description, note }) {
        let obj = this.mapsList.searchByObjectKey('id', this.selectedMapId);
        obj.name = name;
        obj.description = description;
        obj.note = note;
      },
      updateEditingMap (event) {
        exists(this._loadingTimeout) && clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;

        this.selectedMapId = event.data.id;
        this.isEditingFormLoading = false;
        this.isEditingMap = true;
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "../../../css/variables";

  $edit-part-width: 400;
  $threshold: 850;

  .table-text {
    font-size: $font-size-medium-small;
    color: $fg-primary-1;
  }

  .wd-groups {
    display: flex;
    width: 100%;


    .wd-groups__info {
      transition: width 350ms, height 350ms;
      background-color: $bg-secondary;

      .wd-wgi-container {
        display: flex;
        flex-direction: column;

        & > * {
          height: 50%;
        }
      ;
      }
    }

    .wd-groups__table {
      transition: width 350ms, height 350ms;
      width: 100%;
      height: 100%;
    }

    @media screen and (max-width: #{$threshold}px) {
      flex-direction: column;

      .wd-groups__table {
        transition: width 350ms, height 350ms;
        height: 30%;
      }

      .wd-groups__info {
        height: 70%;
      }
    }

    @for $i from 0 through 3 {
      @media screen and (min-width: #{$threshold + 1 + 300 * $i}px) {
        .wd-groups__table {
          transition: width 350ms, height 350ms;
          width: calc(100% - #{$edit-part-width + 150 * $i}px);
        }

        .wd-groups__info {
          width: #{$edit-part-width + 150 * $i}px;
        }
      }
    }
  }

</style>
