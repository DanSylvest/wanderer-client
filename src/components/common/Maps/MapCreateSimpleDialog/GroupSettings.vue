<template>
  <div class="wd-group-settings-part">
    <div class="md-subheading wd-hint-accent">{{ TEXT.groupSettingsPart.title }}</div>

    <md-field v-if="false">
      <label>{{ TEXT.groupSettingsPart.characterSelectLabel }}</label>
      <md-select md-dense v-model="selectedCharacterId" @md-selected="onSelected">
        <md-option v-for="{id, name} in characterIds_" :value="id" :key="id">{{ name }}</md-option>
      </md-select>
    </md-field>

    <div class="wd-share-settings" v-if="enableCorporation">
      <div class="wd flex fjs flex-align-center" style="height: 30px;">
        <md-switch v-model="corporationShare" @change="onCorporationShareChanged">
          {{ TEXT.groupSettingsPart.shareWith }}
          <span class="wd-hint-accent">corporation</span>
        </md-switch>

        <corporation-search-item :corporation-id="corporationId.toString()" />
      </div>

      <div class="wd flex fjs flex-align-center" style="height: 30px;" v-if="enableAlliance">
        <md-switch v-model="allianceShare" @change="onAllianceShareChanged">
          {{ TEXT.groupSettingsPart.shareWith }}
          <span class="wd-hint-accent">alliance</span>
        </md-switch>

        <alliance-search-item :alliance-id="allianceId.toString()" />
      </div>
    </div>

    <template v-if="enableProvider">
      <character-provider
        :key="selectedCharacterId"
        :character-id="selectedCharacterId"
        v-slot="{loaded, data: {allianceId, corporationId}}"
      >
        {{ loaded ? effectSelectedCharacter({ corporationId, allianceId }) : '' }}
      </character-provider>
    </template>

  </div>
</template>

<script>
  import api from '../../../../js/api';
  import helper from '../../../../js/utils/helper';
  import CharacterProvider from '../../../providers/CharacterProvider';
  import CorporationSearchItem from '../../Searcher/SearchItem/CorporationSearchItem';
  import AllianceSearchItem from '../../Searcher/SearchItem/AllianceSearchItem';
  import { TEXT } from './constants';
  import { mapActions } from 'vuex';

  export default {
    name: 'GroupSettings',
    components: { AllianceSearchItem, CorporationSearchItem, CharacterProvider },
    props: {
      active: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        TEXT,
        characterIds_: [],
        selectedCharacterId: null,
        corporationShare: false,
        allianceShare: false,
        corporationId: null,
        allianceId: null,
      };
    },
    mounted () {
      const state = this.$store.state['mapCreateSimpleDialogStore'];
      if (state && state.characterId) {
        this.selectedCharacterId = state.characterId;
      }
    },
    watch: {
      active (val) {
        if (val) {
          const state = this.$store.state['mapCreateSimpleDialogStore'];
          if (state && state.characterId) {
            this.selectedCharacterId = state.characterId;
          } else {
            this.loadCharacters();
          }
        }
      },
    },
    computed: {
      enableProvider () {
        return this.selectedCharacterId !== null;
      },
      enableCorporation () {
        return !!this.corporationId;
      },
      enableAlliance () {
        return !!this.allianceId;
      },
    },
    methods: {
      ...mapActions('mapCreateSimpleDialogStore', [
        'updateShare',
      ]),
      loadCharacters () {
        api.eve.character.list()
          .then(
            this.onLoadedCharacters.bind(this),
            err => helper.errorHandler(this, err),
          );
      },
      /**
       *
       * @param {{name: string, id: string}[]} event
       */
      onLoadedCharacters (event) {
        this.characterIds_ = event;
        this.selectedCharacterId = this.characterIds_.first().id;
        this.corporationShare = false;
        this.allianceShare = false;

        this.updateShare({ characterId: this.selectedCharacterId });
      },
      onCorporationShareChanged (isShare) {
        this.updateShare({ shareCorporation: isShare });
      },
      onAllianceShareChanged (isShare) {
        this.updateShare({ shareAlliance: isShare });
      },
      resetSharing () {
        this.corporationShare = false;
        this.allianceShare = false;

        this.updateShare({ shareCorporation: false, shareAlliance: false });
      },
      onSelected () {
        this.updateShare({ characterId: this.selectedCharacterId });
        this.updateShare({ shareCorporation: false, shareAlliance: false });
        this.resetSharing();
      },
      /**
       * @param {CorpId & AllyId} prop
       */
      effectSelectedCharacter ({ corporationId, allianceId }) {
        this.corporationId = corporationId;
        this.allianceId = allianceId;
        this.resetSharing();
        return '';
      },
    },
  };

</script>

<style lang="scss" scoped>
  @import "src/css/variables";

  .wd-share-settings {
    font-size: 12px;
  }

  .wd-group-settings-part {
    min-height: 400px;
    min-width: 696px;
  }

  .md-field.md-theme-default.md-has-textarea:not(.md-autogrow):after {
    border-color: $border-color-primary-3;
  }

  .md-autocomplete.md-field {
    margin: 0;
  }

</style>