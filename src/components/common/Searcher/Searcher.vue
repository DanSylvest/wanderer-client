<template>
  <div class="wd-character-searcher wd fs">
    <search-field :type="type" @add-item="handleAddItem" />
    <search-list :type="type" :items="items_" @changed="handleChangedList" />
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
    },
    data () {
      return {
        items_: this.items,
      };
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