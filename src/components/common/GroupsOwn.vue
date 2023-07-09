<template>
  <div class="wd fs">
    <transition name="fade">
      <div class="wd fs wd-groups" v-if="showGroups">
        <div class="wd fs padding-primary wd-groups__table">
          <wd-table
            :rows="groupsOwnList"
            @row-clicked="onRowClicked"
            @selected="selectedGroups = $event"
            selectable
            class="text-centering wd"
            :active-rows="activeRows"
          >
            <template v-slot:toolbar>
              <div class="md-toolbar-section-start">
                Access lists (Owner/Moderator)
              </div>

              <div class="md-toolbar-section-end">
                <md-button class="md-dense md-primary md-raised" @click="onShowCreateDialog">
                  <div class="wd-groups-add-button">
                    <md-icon>library_add</md-icon>
                    <span style="vertical-align: middle">New Access list</span>
                  </div>
                </md-button>
              </div>
            </template>

            <template v-slot:alternate-toolbar>
              <div class="md-toolbar-section-start">
                Actions with selected
              </div>

              <div class="md-toolbar-section-end">
                <md-button class="md-icon-button" @click="onRemoveGroups">
                  <md-tooltip md-direction="bottom">Delete</md-tooltip>
                  <md-icon>delete</md-icon>
                </md-button>
              </div>
            </template>

            <template v-slot:header>
              <table-header-cell sortable id="name">Name</table-header-cell>
              <table-header-cell sortable id="description">Description</table-header-cell>
            </template>

            <template v-slot:row="{row}">
              <table-cell id="name" class="wd padding-vertical-small table-text">{{ row.name }}</table-cell>
              <table-cell id="description" class="wd padding-horizontal-primary table-text">{{ row.description }}</table-cell>
            </template>
          </wd-table>
        </div>

        <div class="wd-groups__info">
          <transition name="fade">
            <div v-if="isEditingGroup" class="wd-wgi-container wd fs">
              <group-editor :group-id="selectedGroupId" @success="onGroupEdited" :editing="true" />
              <related-maps :group-id="selectedGroupId" />
            </div>
          </transition>

          <transition name="fade">
            <md-empty-state
              v-if="!isEditingGroup"
              md-icon="group"
              md-label="Group isn't selected"
              md-description="Select a group - in order to change settings."
            />
          </transition>
        </div>

      </div>
    </transition>

    <transition name="fade">
      <md-empty-state
        v-if="showEmptyGroups"
        md-icon="layers"
        md-label="Create your group!"
        md-description="Group allow you attach characters, corporations and alliances. Also you able to attach group to your own map."
      >
        <md-button class="md-dense md-primary md-raised" @click="onShowCreateDialog">
          <span style="vertical-align: middle">Create</span>
        </md-button>
      </md-empty-state>
    </transition>

    <group-create-dialog :show.sync="showCreateDialog" @success="onGroupCreated" />
  </div>

</template>

<script>
  import WdTable from '../ui/Table/WdTable.vue';
  import TableCell from '../ui/Table/TableCell.vue';
  import TableHeaderCell from '../ui/Table/TableHeaderCell.vue';
  import GroupsOwnMixin from '../mixins/groupsOwn.js';
  import ServerStatusMixin from '../mixins/serverStatus.js';
  import GroupEditor from './groups/GroupEditor.vue';
  import exists from '../../js/env/tools/exists.js';
  import GroupCreateDialog from './groups/GroupCreateDialog.vue';
  import RelatedMaps from './groups/RelatedMaps.vue';
  import api from '../../js/api.js';
  import helper from '../../js/utils/helper.js';

  const TRANSITION_TIMEOUT = 150;

  export default {
    name: 'OwnGroups',
    components: {
      WdTable,
      TableCell,
      TableHeaderCell,
      GroupEditor,
      GroupCreateDialog,
      RelatedMaps,
    },
    mixins: [GroupsOwnMixin, ServerStatusMixin],
    props: [],
    data: function () {
      return {
        isEditingGroup: false,
        isEditingFormLoading: false,
        selectedGroupId: null,
        activeRows: [],
        showCreateDialog: false,
        selectedGroups: [],
      };
    },
    beforeDestroy () {
      exists(this._loadingTimeout) && clearTimeout(this._loadingTimeout);
      this._loadingTimeout = null;
    },
    computed: {
      loaded () {
        return this.loadedServerStatus && this.loadedGroupsOwn;
      },
      hasGroups () {
        return this.groupsOwnList.length > 0;
      },
      showGroups () {
        return this.loaded && this.hasGroups/* false*/;
      },
      showEmptyGroups () {
        return this.loaded && !this.hasGroups /*true*/;
      },
    },
    methods: {
      onRemoveGroups () {
        Promise.all(this.selectedGroups.map(x => api.eve.group.remove(x.id)))
          .then(
            () => {
              this.selectedGroups.map(x => this.groupsOwnList.eraseByObjectKey('id', x.id));
              if (this.selectedGroups.includes(this.selectedGroupId)) {
                this.selectedGroupId = null;
                this.isEditingGroup = false;
                this.isEditingFormLoading = false;
              }
            },
            err => helper.errorHandler(this, err),
          );
      },
      onRowClicked (event) {
        if (this.selectedGroupId === event.data.id)
          return;

        this.activeRows = [this.groupsOwnList.searchByObjectKey('id', event.data.id)];

        if (this.isEditingGroup && !this.isEditingFormLoading) {
          this.isEditingGroup = false;
          this.isEditingFormLoading = true;

          this._loadingTimeout = setTimeout(() => this.updateEditingGroup(event), TRANSITION_TIMEOUT);
        } else {
          this.updateEditingGroup(event);
        }
      },
      updateEditingGroup (event) {
        exists(this._loadingTimeout) && clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;

        this.selectedGroupId = event.data.id;
        this.isEditingFormLoading = false;
        this.isEditingGroup = true;
      },
      onGroupCreated (data) {
        this.groupsOwnList.push(data);
      },
      onGroupEdited (data) {
        let obj = this.groupsOwnList.searchByObjectKey('id', this.selectedGroupId);
        obj.name = data.name;
        obj.description = data.description;
      },
      onShowCreateDialog: function () {
        this.showCreateDialog = true;
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "./src/css/variables";

  $edit-part-width: 500;
  $threshold: 850;

  .table-text {
    font-size: $font-size-medium-small;
    color: $fg-primary-1;
  }

  .wd-groups {
    display: flex;
    width: 100%;

    .wd-groups-add-button {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .wd-groups__info {
      transition: width 350ms, height 350ms;
      background-color: $bg-secondary;
      /*width: 100%;*/
      /*height: 100%;*/

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
          width: calc(100% - #{$edit-part-width + 100 * $i}px);
        }

        .wd-groups__info {
          width: #{$edit-part-width + 100 * $i}px;
        }
      }
    }
  }

</style>
