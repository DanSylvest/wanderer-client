<template>
  <div class="wd-final-part">
    <div class="wd flex flex-justify-sb">
      <div class="wd-column">
        <div class="wd font-size-medium-large wd-padding-bottom">Map settings</div>

        <wd-note title="name" class="wd-accent-title wd-custom-note-content">{{ mapName }}</wd-note>
        <wd-note title="description" class="wd-accent-title wd-custom-note-content">{{ mapDescription }}</wd-note>
        <wd-note title="note" class="wd-accent-title wd-custom-note-content">
          <template v-if="simpleNote_">
            {{ mapNote }}
          </template>
          <template v-else>
            This map was created by <span class="wd fg-contrast-2">{{ sharedCharacterName }}</span>
            <template v-if="willSharedFor.length !== 0">
              for <span class="wd fg-contrast-2">{{ willSharedFor }}</span>.
            </template>
          </template>
        </wd-note>
      </div>

      <div class="wd-column">
        <div class="wd font-size-medium-large wd-padding-bottom">Group settings</div>

        <wd-note title="name" class="wd-accent-title wd-custom-note-content">{{ groupName }}</wd-note>
        <wd-note title="description" class="wd-accent-title wd-custom-note-content">{{ groupDescription }}</wd-note>
      </div>

      <div class="wd-column">
        <div class="wd font-size-medium-large wd-padding-bottom">Will shared for</div>

        <wd-note title="character" class="wd-accent-title wd-custom-note-content">
          <character-search-item :character-id="characterId_" hide-ticker />
        </wd-note>

        <wd-note
          title="corporation"
          v-if="shareCorporation && corporationId"
          class="wd-accent-title wd-custom-note-content"
        >
          <corporation-search-item :corporation-id="corporationId.toString()" />
        </wd-note>

        <wd-note title="alliance" v-if="shareAlliance && allianceId" class="wd-accent-title wd-custom-note-content">
          <alliance-search-item :alliance-id="allianceId.toString()" />
        </wd-note>
      </div>

    </div>

    <character-provider
      :character-id="characterId_"
      v-slot="{loaded, data: {characterName, allianceName, corporationName, allianceId, corporationId}}"
    >
      {{ loaded
      ? effectCharacterProvider({ characterName, allianceName, corporationName, allianceId, corporationId })
      : '' }}
    </character-provider>
  </div>
</template>

<script>
  import { TEXT } from './constants';
  import { mapActions } from 'vuex';
  import WdNote from '../../../ui/WdNote';
  import CharacterProvider from '../../../providers/CharacterProvider';
  import CharacterSearchItem from '../../Searcher/SearchItem/CharacterSearchItem';
  import CorporationSearchItem from '../../Searcher/SearchItem/CorporationSearchItem';
  import AllianceSearchItem from '../../Searcher/SearchItem/AllianceSearchItem';

  export default {
    name: 'FinalPart',
    components: { AllianceSearchItem, CorporationSearchItem, CharacterSearchItem, CharacterProvider, WdNote },
    props: {
      active: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        TEXT,
        simpleNote_: true,
        characterId_: null,

        mapName: '',
        mapDescription: '',
        mapNote: '',

        groupName: '',
        groupDescription: '',

        sharedCharacterName: '',
        sharedCorporationName: null,
        sharedAllianceName: null,
        allianceId: null,
        corporationId: null,

        shareCorporation: false,
        shareAlliance: false,
      };
    },
    watch: {
      active (val) {
        val && this.updateData();
      },
    },
    computed: {
      state_ () {
        return this.$store.state['mapCreateSimpleDialogStore'];
      },
      willSharedFor () {
        const out = [];
        this.shareCorporation && out.push(this.sharedCorporationName);
        this.shareAlliance && out.push(this.sharedAllianceName);
        return out.join(', ');
      },
    },
    methods: {
      ...mapActions('mapCreateSimpleDialogStore', [
        'setMapDataAndValid',
        'setMapInvalid',
      ]),
      effectCharacterProvider ({ characterName, corporationName, allianceName, allianceId, corporationId }) {
        this.sharedCharacterName = characterName;
        this.sharedCorporationName = corporationName;
        this.sharedAllianceName = allianceName;
        this.allianceId = allianceId;
        this.corporationId = corporationId;
      },

      updateData () {
        const {
          mapName,
          mapDescription,
          mapNote,
          groupName,
          groupDescription,
          characterId,
          shareCorporation,
          shareAlliance,
        } = this.state_;

        this.characterId_ = characterId;

        this.mapName = mapName;
        this.shareCorporation = shareCorporation;
        this.shareAlliance = shareAlliance;

        const currentTime = new Date().toUTCString();
        if (mapDescription === '') {
          this.mapDescription = `This map was created in ${ currentTime }.`;
        } else {
          this.mapDescription = mapDescription;
        }

        if (mapNote === '') {
          this.simpleNote_ = false;
          this.mapNote = ``;
        } else {
          this.mapNote = mapNote;
        }

        this.groupName = groupName;
        if (groupDescription === '') {
          this.groupDescription = `This group was created in ${ currentTime }.`;
        } else {
          this.groupDescription = groupDescription;
        }
      },
    },
  };

</script>

<style lang="scss">
  @import "src/css/variables";

  .wd-final-part {
    min-height: 300px;

    .wd-padding-bottom {
      margin-bottom: 10px;
    }

    .wd-column {
      width: 200px;

      .wd-note {
        margin-bottom: 10px;
      }
    }

    .wd-custom-note-content {
      .wd-note__content {
        color: $fg-primary;
      }
    }
  }
</style>
