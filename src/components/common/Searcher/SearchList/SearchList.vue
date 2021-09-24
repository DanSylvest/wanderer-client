<template>
  <div class="wd f-width relative wd-search-list">
    <transition-group name="fade">
      <div v-if="convertedItems.length > 0" class="wd fs" key="first">
        <wd-table
          :rows="convertedItems"
          @selected="selected = $event"
          selectable
          class="wd padding-primary fs">
          <template v-slot:toolbar>
            <div class="md-toolbar-section-start wd-capital-letter">List of {{ type_ }}s</div>
          </template>

          <template v-slot:alternate-toolbar>
            <div class="md-toolbar-section-start wd-capital-letter">{{ type_ }}s selected - {{ selected.length }}</div>

            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button" @click="onClickDelete">
                <md-icon>delete</md-icon>
              </md-button>
            </div>
          </template>

          <template v-slot:header>
            <table-header-cell sortable id="name" alignment="start" class="wd-capital-letter">
              {{ type_ }} names
            </table-header-cell>
          </template>

          <template v-slot:row="{row: {id}}">
            <table-cell id="name" class="wd fs padding-horizontal-primary" alignment="start">
              <character-search-item :character-id="id.toString()" v-if="isCharacter" />
              <corporation-search-item :corporation-id="id.toString()" v-if="isCorporation" />
              <alliance-search-item :alliance-id="id.toString()" v-if="isAlliance" />
            </table-cell>
          </template>
        </wd-table>
      </div>

      <div class="wd f-width absolute top" v-show="convertedItems.length === 0" key="second">
        <md-empty-state
          :md-icon="emptyStateIcon"
          :md-label="emptyStateLabel"
          :md-description="emptyStateDescription"
        />
      </div>
    </transition-group>
  </div>
</template>

<script>
  import WdTable from '../../../ui/Table/WdTable';
  import TableHeaderCell from '../../../ui/Table/TableHeaderCell';
  import TableCell from '../../../ui/Table/TableCell';
  import CharacterSearchItem from '../SearchItem/CharacterSearchItem';
  import CorporationSearchItem from '../SearchItem/CorporationSearchItem';
  import { isAlliance, isCharacter, isCorporation } from '../utils/helper';
  import AllianceSearchItem from '../SearchItem/AllianceSearchItem';

  const emptyStateIcons = {
    character: 'group_add',
    corporation: 'group_add',
    alliance: 'public',
  };

  export default {
    name: 'SearchList',
    components: { AllianceSearchItem, CorporationSearchItem, CharacterSearchItem, TableCell, TableHeaderCell, WdTable },
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      type: {
        type: String,
        default: 'character',
      },
    },
    watch: {
      items (val) {
        this.items_ = val;
      },
    },
    data () {
      return {
        type_: this.type,
        items_: this.items,
        selected: [],
      };
    },
    computed: {
      isCharacter,
      isCorporation,
      isAlliance,
      convertedItems () {
        return this.items_.map(id => ({ id }));
      },
      emptyStateIcon () {
        return emptyStateIcons[this.type_];
      },
      emptyStateLabel () {
        return `Add ${ this.type_ }s`;
      },
      emptyStateDescription () {
        return `In this group is not added any ${ this.type_ }. Here you can search ${ this.type_ } and attach them to group.`;
      },
    },
    methods: {
      onClickDelete () {
        this.items_ = this.items_.filter(id => this.selected.search('id', id) == null);
        this.$emit('changed', [...this.items_]);
      },
    },
  };
</script>

<style scoped lang="scss"></style>