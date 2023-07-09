<template>
  <div>
    <searcher
      type="Access list"
      :items="groups"
      show-list-if-empty
      @changed="onChanged"
      :searchFunction="searchFunction"
    >
      <template #search-item="{data: {item: {itemId}}}">
        <div class="wd-group-selected-item">
          <span>{{ getGroupInfo(itemId, 'name') }}</span>
          <span class="wd font-size-small-large wd-group-selected-item__description">
            {{ getGroupInfo(itemId, 'description') }}
          </span>
        </div>
      </template>

      <template #selected-item="{itemId}">
        <div class="wd-group-selected-item">
          <span>{{ getGroupInfo(itemId, 'name') }}</span>
          <span class="wd font-size-small-large wd-group-selected-item__description">
            {{ getGroupInfo(itemId, 'description') }}
          </span>
        </div>
      </template>

      <template #empty-state-list>
        <md-empty-state
          md-icon="manage_accounts"
          md-label="New Access list"
          md-description="Everyone in group get access to your map"
        />
      </template>
    </searcher>
  </div>
</template>

<script>
  import MapInfoMixin from '../../../mixins/mapInfo';
  import GroupsOwnMixin from '../../../mixins/groupsOwn';
  import MapGroupsMixin from '../../../mixins/mapGroups';
  import Searcher from '../../Searcher/Searcher';

  export default {
    name: 'MapEditorGroups',
    components: { Searcher },
    mixins: [MapInfoMixin, GroupsOwnMixin, MapGroupsMixin],
    props: {
      selected: {
        type: [Array, null],
        default: null,
      },
    },
    data () {
      return {
        helpCounter: 0,
      };
    },
    watch: {
      mapId (val) {
        this.lMapId = val;

        MapInfoMixin.methods.callUpdate(this);
        MapGroupsMixin.methods.callUpdate(this);
      },
    },
    computed: {
      groups () {
        return this.selectedItems || this.currentMapGroups || [];
      },
      currentMapGroups () {
        if (!this.mapGroups) {
          return null;
        }

        return this.mapGroups.map(x => x.id);
      },
      selectedItems () {
        if (!this.selected || this.selected.length === 0) {
          return null;
        }

        return this.selected;
      },
    },
    methods: {
      async searchFunction () {
        return this.groupsOwnList.map(({ id: itemId, name }) => ({ itemId, name }));
      },
      onChanged (groups) {
        const hasChanges = !this.groups.map(x => x.id).equals(groups);

        if (groups.length > 0) {
          this.$emit('validWithData', { groups, hasChanges });
        } else {
          this.$emit('invalid');
        }

        this.$emit('update:selected', groups);
      },
      getGroupInfo (id, propName) {
        if (this.groupsOwnList.length === 0) {
          return null;
        }

        const res = this.groupsOwnList.find(x => x.id === id);
        return res ? res[propName] : null;
      },
    },
  };
</script>

<style scoped lang="scss">
  @import "./src/css/variables";

  .wd-group-selected-item {
    .wd-group-selected-item__description {
      margin-left: 10px;
      color: $fg-primary-2;
    }
  }
</style>