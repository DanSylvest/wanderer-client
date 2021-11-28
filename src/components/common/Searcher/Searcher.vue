<template>
  <div class="wd-character-searcher wd fs">
    <search-field
      :type="type"
      :search-function="searchFunction_"
      :show-list-if-empty="showListIfEmpty"
      @add-item="handleAddItem"
    >
      <template #search-item="{data: {item, term}}" v-if="hasSearchItemSlot">
        <slot name="search-item" :data="{item, term}" />
      </template>
    </search-field>

    <search-list :type="type" :items="items_" @changed="handleChangedList">
      <template #selected-item="{itemId}" v-if="hasSearchItemSlot">
        <slot name="selected-item" :item-id="itemId" />
      </template>

      <template #empty-state v-if="hasEmptyStateListSlot">
        <slot name="empty-state-list" />
      </template>
    </search-list>
  </div>
</template>

<script>
  import './styles.scss';
  import SearchField from './SearchField/SearchField';
  import SearchList from './SearchList/SearchList';

  export default {
    name: 'Searcher',
    components: { SearchList, SearchField },
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      type: {
        type: String,
        default: 'character',
      },
      searchFunction: {
        type: [Function, undefined],
        default: undefined,
      },
      showListIfEmpty: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        searchFunction_: this.searchFunction,
        items_: this.items,
      };
    },
    watch: {
      items (val) {
        this.items_ = val;
      },
    },
    computed: {
      hasEmptyStateListSlot () {
        return !!this.$slots['empty-state-list'];
      },
      hasSearchItemSlot () {
        return !!this.$slots['search-item'] || !!this.$scopedSlots['search-item'];
      },
    },
    methods: {
      handleChangedList (itemIds) {
        this.items_ = itemIds;
        this.$emit('changed', this.items_);
      },
      handleAddItem (itemId) {
        if (!this.items_.includes(itemId)) {
          this.items_.push(itemId);
          this.$emit('changed', this.items_);
        }
      },
    },
  };
</script>

<style scoped lang="scss">

  .wd-character-searcher {
    display: flex;
    flex-direction: column;

    .wd-character-searcher_autocomplete {
      margin-right: 7px;
    }

    .wd-search-list {
      overflow: hidden;
    }
  }

  .md-searcher-button {
    position: absolute;
    right: 5px;
    top: 8px;

    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

</style>