<template>
  <div class="wd off-user-select">
    <md-dialog :md-active.sync="showEditDialog" @md-opened="onEditDialogOpened" @md-closed="onDialogClosed"
               class="wd-medium-dialog">
      <md-dialog-title>Creating map</md-dialog-title>

      <div class="wd box-sizing wd-dialog-content off-user-select">
        <md-field md-clearable>
          <label>Name</label>
          <md-input v-model="formName" @input="onEditFormChange" @change="onEditFormChange"></md-input>
          <transition name="fade">
            <span class="wd-hint-negative md-helper-text" v-if="!isValidName">* Map name should contain at least 3 symbols and begins with a symbol</span>
            <span class="wd-hint-positive md-helper-text" v-if="isValidName">Name is valid</span>
          </transition>
        </md-field>

        <md-field md-clearable>
          <label>Description</label>
          <md-input v-model="formDescription" @input="onEditFormChange" @change="onEditFormChange"></md-input>
          <span class="wd-hint-positive md-helper-text">You can leave this field empty</span>
        </md-field>

        <md-field md-clearable>
          <md-autocomplete2
            v-model="chosen"
            :md-options="characterIds_"
            md-layout="box"
            md-input-id-key="name"
            md-input-title-key="name"
            @md-selected="onACSelected"
            @md-changed="onACChanged"
            @md-opened="onACOpened"
            md-dense>

            <label class="wd-search-placeholder">
              <md-icon style="margin-top: -2px;">search</md-icon>
              <span style="margin-left: 13px;">Search a character</span>
            </label>

            <template slot="md-autocomplete-item" slot-scope="{ item, term }">
              <character-search-item :character-id="item.id" :match="term" />
            </template>

            <template slot="md-autocomplete-empty" slot-scope="{ term }">
              Such character not found "{{ term }}"!
            </template>
          </md-autocomplete2>

          <transition name="fade">
            <span class="wd-hint-negative md-helper-text" v-if="!isValidCharacter">* Choose a character to create a map for</span>
          </transition>
        </md-field>

        <div>
          <md-checkbox v-model="formIsCorporationShare" class="md-primary" :disabled="!enableCorporations">Share with
            corporation
          </md-checkbox>
        </div>
        <div>
          <md-checkbox v-model="formIsAllianceShare" class="md-primary" :disabled="!enableAlliances">Share with
            alliance
          </md-checkbox>
        </div>
      </div>

      <md-dialog-actions>
        <md-button class="md-primary md-accent" @click="showEditDialog = false">Close</md-button>
        <md-button
          class="md-primary md-raised"
          @click="onEditSubmit"
          :disabled="formButtonDisabled">Confirm
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <character-provider v-if="!!selectedCharacterId"
                        :character-id="selectedCharacterId"
                        v-slot="{data: {allianceId, corporationId}}">
      {{ effectSelectedCharacter({ allianceId, corporationId }) }}
    </character-provider>
  </div>
</template>

<script>
  import api from '../../../js/api';
  import exists from '../../../js/env/tools/exists';
  import helper from '../../../js/utils/helper.js';
  import MdAutocomplete2 from '../../ui/MdAutocomplete/MdAutocomplete';
  import CharacterSearchItem from '../Searcher/SearchItem/CharacterSearchItem';
  import CharacterProvider from '../../providers/CharacterProvider';

  export default {
    name: 'MapCreateSimpleDialog',
    components: { CharacterProvider, MdAutocomplete2, CharacterSearchItem },
    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        chosen: '',
        characterIds_: [],
        selectedCharacterId: null,

        enableCorporations: false,
        enableAlliances: false,

        formName: '',
        formDescription: '',
        formIsCorporationShare: false,
        formIsAllianceShare: false,
        formButtonDisabled: true,
        showEditDialog: false,

        isValidName: false,
        isValidDescr: true,
        isValidCharacter: true,
      };
    },
    watch: {
      /**
       *
       * @param {boolean} isShow
       */
      async show (isShow) {
        if (!isShow) {
          this.showEditDialog = isShow;
          return;
        }

        this.characterIds_ = [];
        api.eve.character.list()
          .then(
            event => {
              this.characterIds_ = event;
              this.chosen = this.characterIds_.first().name;
              this.selectedCharacterId = this.characterIds_.first().id;
              this.showEditDialog = true;
            },
            err => helper.errorHandler(this, err),
          );
      },
    },
    methods: {
      /**
       * @param {CorpId & AllyId} prop
       */
      effectSelectedCharacter ({ corporationId, allianceId }) {
        this.updateSwitchboxes({ corporationId, allianceId });
        this.validateEditForm();
        return '';
      },

      /**
       * @param {CorpId & AllyId} [prop]
       */
      updateSwitchboxes (prop) {
        const { corporationId = null, allianceId = null } = prop || {};

        this.formIsCorporationShare = false;
        this.formIsAllianceShare = false;
        this.enableCorporations = !!corporationId;
        this.enableAlliances = !!allianceId;
      },
      onACOpened () {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
      },
      onACChanged () {
        this.selectedCharacterId = null;
        this.updateSwitchboxes();
        this.validateEditForm();
      },
      async onACSelected ({ id }) {
        await this.$nextTick();
        this.selectedCharacterId = id.toString();
        this.updateSwitchboxes();
        this.validateEditForm();
      },
      onEditDialogOpened () {
        this.validateEditForm();
      },
      onDialogClosed () {
        this.clearForm();
        this.$emit('update:show', false);
      },
      async onEditSubmit () {
        const data = {
          name: this.formName,
          description: this.formDescription,
          shareForCorporation: this.formIsCorporationShare,
          shareForAlliance: this.formIsAllianceShare,
          characterId: this.selectedCharacterId,
        };

        api.eve.map.addFast(data)
          .then(
            ({ mapId, name, owner, description, groups }) => {
              this.$emit('success', { id: mapId, name, owner, description, groups });
              this.onDialogClosed();
            },
            error => helper.errorHandler(this, error),
          );
      },
      onEditFormChange () {
        this.validateEditForm();
      },
      validateEditForm () {
        let isValidName = validateName(this.formName, 3);
        let isValidDescription = validateName(this.formDescription, 0);
        let isValidCharacter = exists(this.selectedCharacterId);

        this.isValidName = isValidName;
        this.isValidDescr = isValidDescription;
        this.isValidCharacter = isValidCharacter;

        this.formButtonDisabled = !(isValidName && isValidDescription && isValidCharacter);
      },
      clearForm () {
        this.selectedCharacterId = null;
        this.formName = '';
        this.formDescription = '';
        this.formIsCorporationShare = false;
        this.formIsAllianceShare = false;
        this.enableCorporations = false;
        this.enableAlliances = false;

      },
    },
  };

  let validateName = function (_nickname, _allowLength) {
    _allowLength = _allowLength !== undefined ? _allowLength : 3;

    if (_allowLength === 0 && _nickname === '')
      return true;

    if (!_nickname)
      return false;

    if (_nickname.length <= _allowLength)
      return false;

    return !!_nickname.match(/[A-Za-z_][A-Za-z0-9_\- ]*?/m);
  };
</script>

<style lang="scss">
  @import "./src/css/variables";

  .wd-char-item {

    & > img {
      margin-right: 10px !important;
      height: 30px;
      width: 30px;
    }
  }

  .wd-medium-dialog {
    .md-dialog-title {
      padding: 20px 20px 0;
    }


    .wd-dialog-content {
      height: 70%;
      padding-left: 30px;
      padding-right: 30px;
      width: 500px;


      .md-autocomplete.md-field {
        margin: 0;
      }

      .groups-table {
        height: 400px;

        &.md-card.md-table,
        &.md-table.md-theme-default .md-table-content,
        &.md-table.md-theme-default .md-table-alternate-header {
          background-color: $bg-secondary;
        }
      }
    }
  }
</style>