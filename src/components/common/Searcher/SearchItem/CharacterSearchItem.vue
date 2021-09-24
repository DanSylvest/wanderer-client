<template>
  <div class="wd-search-item">
    <transition name="fade">
      <div v-if="loadedCharacter" class="wd-search-content">
        <img
          class="md-icon"
          :src="getCharacterLogo(lCharacterId)"
          style="margin-right: 10px;"
          alt=""
          loading="lazy"
        />
        <md-highlight-text :md-fuzzy-search="true" :md-term="match">{{ characterName }}</md-highlight-text>
        <div class="wd-character-alliance" v-if="hasAlliance">[{{ allianceTicker }}]</div>
        <div class="wd-character-corporation" v-else-if="hasCorporation">[{{ corporationTicker }}]</div>&nbsp;
      </div>
    </transition>

    <div v-show="!loadedCharacter" class="wd-loader">
      <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="20"
                           md-mode="indeterminate"></md-progress-spinner>
    </div>
  </div>
</template>

<script>
  import './styles.scss';
  import CharacterPublicInfoMixin from '../../../mixins/character/publicInfo';
  import AlliancePublicInfoMixin from '../../../mixins/alliance/publicInfo';
  import CorporationPublicInfoMixin from '../../../mixins/corporation/publicInfo';
  import { CharacterInfoHelperMixin } from '../../../mixins/characterInfoHelper';
  import { getCharacterPortraitUrl } from '../../../utils/eveResources';

  export default {
    name: 'CharacterSearchItem',
    props: {
      match: {
        type: String,
        default: '',
      },
    },
    data () {
      return {
        beforeMatch_: '',
        match_: '',
        afterMatch_: '',
      };
    },
    mixins: [
      CharacterPublicInfoMixin,
      AlliancePublicInfoMixin,
      CorporationPublicInfoMixin,
      CharacterInfoHelperMixin,
    ],
    methods: {
      getCharacterLogo: id => getCharacterPortraitUrl({ id, size: 32 }),
    },
  };
</script>