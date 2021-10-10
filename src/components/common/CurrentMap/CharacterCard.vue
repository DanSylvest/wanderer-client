<template>
  <div>
    <div v-if="!characterInfoLoaded" class="wd-character-card__loader wd fs absolute top" key="first">
      <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="60"
                           md-mode="indeterminate" />
    </div>

    <transition name="fade">
      <div class="wd-character-card" v-if="characterInfoLoaded">
        <div class="wd-character-avatar f-width f-height wd-bg-default wd relative"
             :class="{'character-online':online}" :style="getCharImageUrlStyle(this.lCharacterId)">

        </div>
        <div class="wd-character-content">
          <system-card :map-id="mapId_" :solar-system-id="location" />
          <ship :ship-id="ship" />
          <div class="wd-characters-info">
            <div class="wd-character-name">{{ characterName }}</div>
            <div class="wd-character-corporation" v-if="hasCorporation">{{ corporationName }}</div>
            <div class="wd-character-alliance" v-if="hasAlliance">{{ allianceName }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import SystemCard from './SystemCard.vue';
  import Ship from '../universe/Ship.vue';
  import CharacterMixin from '../../mixins/character.js';
  import CharacterPublicInfoMixin from '../../mixins/character/publicInfo';
  import CorporationPublicInfoMixin from '../../mixins/corporation/publicInfo';
  import AlliancePublicInfoMixin from '../../mixins/alliance/publicInfo';
  import { CharacterInfoHelperMixin } from '../../mixins/characterInfoHelper';
  import { getCharImageUrlStyle } from '../../utils/eveResources';

  export default {
    name: 'CharacterCard',
    components: { SystemCard, Ship },
    mixins: [
      CharacterMixin,
      CharacterPublicInfoMixin,
      CorporationPublicInfoMixin,
      AlliancePublicInfoMixin,
      CharacterInfoHelperMixin,
    ],
    props: {
      mapId: {
        type: String,
        default: null,
      },
    },
    data: function () {
      return {
        mapId_: this.mapId,
        loadDynamicCharacterData: true,
      };
    },
    watch: {
      mapId (val) {
        this.mapId_ = val;
      },
    },
    methods: {
      getCharImageUrlStyle,
    },
  };
</script>

<style lang="scss">
  @import "/src/css/variables";
  @import "~vue-material/dist/theme/engine";

  $character-color-1: md-get-palette-color(orange, 500);

  .small-image {
    width: 48px;
    height: 48px;

    border-radius: 10%;
    border-width: 2px;
    border-style: solid;
    border-color: $border-color-primary-5-2;
    background-color: $bg-transparent;
  }

  .wd-character-card__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 350px;
    height: 130px;
  }


  .wd-character-card {
    display: flex;
    justify-content: flex-start;

    background-color: $bg-secondary;
    padding: 10px 10px;
    box-sizing: border-box;
    min-width: 350px;
    max-width: 350px;
    height: 130px;

    & > *:not(:last-child) {
      margin-right: 10px;
    }

    .wd-character-social {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-right: -5px !important;
      align-items: center;
    }

    .wd-character-avatar {
      transition: border-color 250ms, opacity 250ms;

      width: 100px;
      height: 100px;
      min-width: 100px;
      min-height: 100px;
      border-radius: 50%;
      border-width: 3px;
      border-style: solid;
      border-color: $border-color-primary-5-2;
      background-color: $bg-transparent;
      cursor: pointer;

      &.character-online {
        border-color: $color-online;
        opacity: 1;
      }

      &:hover {
        opacity: 1;
        border-color: $fg-theme-primary-solid;
      }
    }

    .wd-character-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding-top: 10px;

      & > * {
        white-space: nowrap;
      }

      & > * {
        padding: initial;
        line-height: initial !important;
        font-size: 12px;
        margin-bottom: 3px;
        color: $fg-primary-2;
      }

      .wd-characters-info {
        display: flex;
        flex-direction: column;
      }

      .wd-character-name {
        font-size: 16px;
        color: $fg-theme-primary-solid;
      }

      .wd-character-corporation {
        //color: $fg-primary-3;
        font-size: 11px;
      }

      .wd-character-alliance {
        color: $fg-primary-3;
        font-size: 11px;
      }
    }
  }
</style>