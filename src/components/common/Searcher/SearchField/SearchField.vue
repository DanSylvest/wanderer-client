<template>
  <div class="wd-character-searcher_autocomplete">
    <md-autocomplete2
      v-model="chosen"
      :md-options="resultList_"
      md-layout="box"
      md-dense
      md-input-id-key="name"
      md-input-title-key="name"
      :md-loading="loading"
      @md-changed="loadList"
      @md-opened="onOpen"
      @md-selected="onSelected"
      :is-not-filter-if-empty-model="showListIfEmpty"
    >
      <template v-if="true">
        <label class="wd-search-placeholder">
          <md-icon style="margin-top: -2px;">search</md-icon>
          <span style="margin-left: 13px;">Search a {{ type }}</span>
        </label>
      </template>

      <template v-else>
        <label class="wd-search-placeholder">
          <md-icon class="wd-color-negative">wifi_tethering_off</md-icon>
          <span>TQ has been down and search not work</span>
        </label>
      </template>

      <template slot="md-autocomplete-item" slot-scope="{ item, term }">
        <slot v-if="hasSearchItemSlot" name="search-item" :data="{item, term}" />

        <template v-else>
          <character-search-item :match="term" :character-id="item.itemId.toString()" v-if="isCharacter" />
          <corporation-search-item :match="term" :corporation-id="item.itemId.toString()" v-if="isCorporation" />
          <alliance-search-item :match="term" :alliance-id="item.itemId.toString()" v-if="isAlliance" />
        </template>
      </template>

      <template slot="md-autocomplete-empty" slot-scope="{ term }">
        <template v-if="term.length === 0">
          Type to search a {{ type }}
        </template>
        <template v-else>
          Such {{ type }} {{ term }} is not exists!
        </template>
      </template>

      <div class="md-searcher-button">
        <md-button
          class="md-raised md-dense md-accent md-icon-button" :disabled="isDisabledAddButton"
          @click="handleAddItem"
        >
          <md-icon>add</md-icon>
        </md-button>
      </div>
    </md-autocomplete2>
  </div>
</template>

<script>
  import CharacterSearchItem from '../SearchItem/CharacterSearchItem';
  import { getCachedCharacterPublicInfo } from '../../../utils/characterSubscription';
  import { getCachedCorporationPublicInfo } from '../../../utils/corporationSubscription';
  import { getCachedAlliancePublicInfo } from '../../../utils/allianceSubscription';
  import SpamFilter from '../../../../js/env/spamFilter';
  import MdAutocomplete2 from '../../../ui/MdAutocomplete/MdAutocomplete';
  import CorporationSearchItem from '../SearchItem/CorporationSearchItem';
  import AllianceSearchItem from '../SearchItem/AllianceSearchItem';
  import { isAlliance, isCharacter, isCorporation } from '../utils/helper';
  import api from '../../../../js/api.js';

  const loadCachedPublicInfo = {
    character: getCachedCharacterPublicInfo,
    corporation: getCachedCorporationPublicInfo,
    alliance: getCachedAlliancePublicInfo,
  };

  export default {
    name: 'SearchField',
    components: { AllianceSearchItem, CorporationSearchItem, MdAutocomplete2, CharacterSearchItem },
    mixins: [],
    props: {
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
        default: false
      }
    },
    data () {
      return {
        chosen: '',
        resultList_: [],
        lastSearchDate: null,
        loading: false,
        lastSelected: null,
      };
    },
    mounted () {
      this._searchCaller = new SpamFilter(this._makeSearch.bind(this), 50);
    },
    beforeDestroy () {
      this._searchCaller.destructor();
    },
    computed: {
      isCharacter,
      isCorporation,
      isAlliance,
      isDisabledAddButton () {
        return this.lastSelected === null;
      },
      hasSearchItemSlot () {
        return !!this.$slots['search-item'] || !!this.$scopedSlots['search-item'];
      },
    },
    methods: {
      handleAddItem () {
        this.$emit('add-item', this.lastSelected.itemId.toString());

        this.chosen = '';
        this.lastSelected = null;
      },
      onOpen () {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
        this.loadList(this.chosen);
      },
      /**
       *
       * @param {number} itemId
       * @param {string} name
       */
      async onSelected ({ itemId, name }) {
        await this.$nextTick();
        this.lastSelected = { itemId, name };
      },
      loadList (searchString) {
        if (this.showListIfEmpty && searchString === '') {
          this._searchCaller.call(searchString);
          return;
        }

        if (this.lastSelected && this.lastSelected.name !== searchString) {
          this.lastSelected = null;
        }

        if (searchString === undefined || searchString.length < 3) {
          this.resultList_ = [];
          this.loading = false;
          return;
        }

        if (searchString.match(/[^A-Za-z0-9. _-]+/im)) {
          this.resultList_ = [];
          this.loading = false;
          return;
        }

        this._searchCaller.call(searchString);
      },

      async defaultSearch (searchString, type) {
        const res = await api.eve.character.search([type], searchString);

        const itemsIds = res && res[type];
        // todo it happens if response is not 200
        if (!itemsIds) {
          return null;
        }

        const filteredCount = itemsIds.slice(0, 15);

        // here we load cached info of characters/corporations/alliances
        const itemsInfo = await Promise.allSettled(filteredCount.map(itemId => loadCachedPublicInfo[type](itemId)));

        const updated = itemsInfo
          .map(x => x.value)
          .map((info, i) => {
            const match = info.name.match(searchString);
            return {
              itemId: filteredCount[i],
              matchIndex: match ? match.index : Infinity,
              ...info,
            };
          });

        return updated.sort((a, b) => {
          const index = a.matchIndex - b.matchIndex;
          return index === 0 ? a.name === b.name ? 0 : a.name > b.name ? 1 : -1 : index;
        });
      },

      async _makeSearch (searchString) {
        this.loading = true;
        const searchDate = +new Date;
        this.lastSearchDate = searchDate;

        const searchFunction = this.searchFunction || this.defaultSearch;
        const data = await searchFunction(searchString, this.type);

        if (this.lastSearchDate !== searchDate) {
          return;
        }

        this.resultList_ = data;
        this.loading = false;
      },
    },
  };
</script>

<style scoped lang="scss">
  .md-searcher-button {
    position: absolute;
    right: 5px;
    top: 8px;

    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
</style>