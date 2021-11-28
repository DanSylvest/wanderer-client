<template>
  <div class="wd fs">
    <transition name="fade">
      <div class="wd fs wd-ui-group-editor" v-if="showMapEditor">
        <div class="wd fs box-sizing padding-primary">
          <wd-tabs @tab-changed="() => helpCounter++">
            <wd-tab
              id="tab-preferences"
              wd-label="Preferences"
              class="wd-tab wd-tab-preferences wd fs box-sizing padding-primary"
            >
              <map-editor-settings
                :name="currentName"
                :description="currentDescription"
                :note="currentNote"
                @validWithData="onEditorValidWithData"
                @invalid="onEditorInvalid"
              />
            </wd-tab>

            <wd-tab id="tab-groups" wd-label="Groups" class="wd-tab wd-tab-groups wd fs box-sizing">
              <map-editor-groups
                :map-id="lMapId"
                :selected.sync="mapGroups"
                @validWithData="onMapGroupsValid"
                @invalid="onMapGroupsInvalid"
              />
            </wd-tab>

          </wd-tabs>
        </div>

        <div class="md-toolbar-section-end">
          <md-button class="md-primary md-raised" @click="onEditSubmit" :disabled="!saveButtonEnabled">Save</md-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import MapInfoMixin from '../../../mixins/mapInfo';
  import WdTab from '../../../ui/Tabs/WdTab';
  import WdTabs from '../../../ui/Tabs/WdTabs';
  import api from '../../../../js/api';
  import helper from '../../../../js/utils/helper';
  import MapEditorSettings from './MapEditorSettings';
  import MapEditorGroups from './MapEditorGroups';

  export default {
    name: 'MapEditor',
    components: {
      MapEditorGroups,
      MapEditorSettings,
      WdTab,
      WdTabs,
    },
    mixins: [MapInfoMixin],
    data () {
      return {
        mapData: null,
        mapGroups: null,
        isDirty: false,
        helpCounter: 0,
      };
    },
    computed: {
      showMapEditor () {
        return this.loadedMapInfo;
      },
      saveButtonEnabled () {
        return this.showMapEditor && this.isDirty && this.valid;
      },
      valid () {
        return !!this.mapData || !!this.mapGroups;
      },
      currentName () {
        return this.mapData ? this.mapData.name : this.mapName;
      },
      currentDescription () {
        return this.mapData ? this.mapData.description : this.mapDescription;
      },
      currentNote () {
        return this.mapData ? this.mapData.note : this.mapNote;
      }
    },
    methods: {
      onEditorValidWithData ({ name, description, note }) {
        this.setDirty();
        this.mapData = { name, description, note };
      },
      onEditorInvalid () {
        this.mapData = null;
      },
      onMapGroupsValid () {
        this.setDirty();
      },
      onMapGroupsInvalid () {
        this.mapGroups = null;
      },
      onEditSubmit () {
        const { name, description, note } = this.mapData || this.mapInfo;

        const opts = {
          name,
          description,
          note,
          ...(this.mapGroups && { groups: this.mapGroups }),
        };

        api.eve.map.edit(this.mapId, opts)
          .then(
            () => {
              this.isDirty = false;
              this.$emit('success', { name, description, note });
            },
            err => helper.errorHandler(this, err),
          );
      },
      setDirty () {
        this.isDirty = true;
      },

    },
  };
</script>

<style scoped lang="scss">
  .md-autocomplete.md-field {
    margin: 0;
  }

  .wd-eve-search {
    display: grid;
    grid-template-rows: auto calc(100% - 68px);
  }
</style>