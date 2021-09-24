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
        <character-search-item :match="term" :character-id="item.itemId.toString()" v-if="isCharacter" />
        <corporation-search-item :match="term" :corporation-id="item.itemId.toString()" v-if="isCorporation" />
        <alliance-search-item :match="term" :alliance-id="item.itemId.toString()" v-if="isAlliance" />
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
        <md-button class="md-raised md-dense md-accent md-icon-button" :disabled="isDisabledAddButton"
                   @click="handleAddItem">
          <md-icon>add</md-icon>
        </md-button>
      </div>
    </md-autocomplete2>
  </div>
</template>

<script>
  import CharacterSearchItem from '../SearchItem/CharacterSearchItem';
  import { getSearch } from '../../../../js/requests/getSearch';
  import { getCachedCharacterPublicInfo } from '../../../utils/characterSubscription';
  import { getCachedCorporationPublicInfo } from '../../../utils/corporationSubscription';
  import { getCachedAlliancePublicInfo } from '../../../utils/allianceSubscription';
  import SpamFilter from '../../../../js/env/spamFilter';
  import MdAutocomplete2 from '../../../ui/MdAutocomplete/MdAutocomplete';
  import CorporationSearchItem from '../SearchItem/CorporationSearchItem';
  import AllianceSearchItem from '../SearchItem/AllianceSearchItem';
  import { isCharacter, isCorporation, isAlliance } from '../utils/helper';

  const loadCachedPublicInfo = {
    character: getCachedCharacterPublicInfo,
    corporation: getCachedCorporationPublicInfo,
    alliance: getCachedAlliancePublicInfo,
  };

  export default {
    name: 'SearchField',
    components: { AllianceSearchItem, CorporationSearchItem, MdAutocomplete2, CharacterSearchItem },
    props: {
      type: {
        type: String,
        default: 'character',
      },
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
      isDisabledAddButton () {
        return this.lastSelected === null;
      },
      isCharacter,
      isCorporation,
      isAlliance,
    },
    methods: {
      handleAddItem () {
        this.$emit('add-item', this.lastSelected.itemId.toString());

        this.chosen = '';
        this.lastSelected = null;
      },
      onOpen () {
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
        if (this.lastSelected && this.lastSelected.name !== searchString) {
          this.lastSelected = null;
        }

        if (searchString === undefined || searchString.length < 3) {
          this.resultList_ = [];
          this.loading = false;
          return;
        }

        if (searchString.match(/[^A-Za-z0-9 _-]+/im)) {
          this.resultList_ = [];
          this.loading = false;
          return;
        }

        this._searchCaller.call(searchString);
      },

      async _makeSearch (searchString) {
        this.loading = true;
        const searchDate = +new Date;
        this.lastSearchDate = searchDate;

        const res = await getSearch({ search: searchString, categories: [this.type] });

        const itemsIds = res && res[this.type];
        // todo it happens if response is not 200
        if (!itemsIds) {
          return;
        }

        const filteredCount = itemsIds.slice(0, 15);

        // here we load cached info of characters/corporations/alliances
        const itemsInfo = await Promise.all(filteredCount.map(itemId => loadCachedPublicInfo[this.type](itemId)));

        // We should be sure completely what last request is last;
        // and if data loading start loading next data - we sure this request is not actual
        if (this.lastSearchDate !== searchDate) {
          return;
        }

        /**
         * inject itemId and matchIndex
         * @type {{allianceId: number, corporationId: number, itemId: number, name: string, matchIndex: number}[]}
         */
        const updated = itemsInfo.map((info, i) => {
          const match = info.name.match(searchString);
          return {
            itemId: filteredCount[i],
            matchIndex: match ? match.index : Infinity,
            ...info,
          };
        });

        this.resultList_ = updated.sort((a, b) => {
          const index = a.matchIndex - b.matchIndex;
          return index === 0 ? a.name === b.name ? 0 : a.name > b.name ? 1 : -1 : index;
        });
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