<template>
    <div class="solar-system-local-character" v-if="loadedCharacter">
        <div class="ss-character-part">
            <span :class="classes">{{ characterName }}</span>
            <template v-if="hasAlliance">
                <span class="solar-system-local-character__ticker">[{{ allianceTicker }}]</span>
            </template>
            <template v-else-if="hasCorporation">
                <span class="solar-system-local-character__ticker">[{{ corporationTicker }}]</span>
            </template>
        </div>

        <ship class="solar-system-local-character__ship" :ship-id="shipTypeId_" :enable-ship-class="false" />
    </div>
</template>

<script>
// import CharacterMixin from "../../../mixins/character.js";
import Ship from "../../universe/Ship.vue";
import CharacterPublicInfoMixin from "../../../mixins/character/publicInfo";
import CorporationPublicInfoMixin from "../../../mixins/corporation/publicInfo";
import AlliancePublicInfoMixin from "../../../mixins/alliance/publicInfo";
import {CharacterInfoHelperMixin} from "../../../mixins/characterInfoHelper";


export default {
    name: "LocalCharacter",
    components: {Ship},
    mixins: [
        CharacterPublicInfoMixin,
        CorporationPublicInfoMixin,
        AlliancePublicInfoMixin,
        CharacterInfoHelperMixin
    ],
    props: {
        isOwn: {
            type: Boolean,
            default: false
        },
        shipTypeId: {
            type: Number,
            default: -1
        }
    },
    data () {
        return {
            isOwn_: this.isOwn,
            shipTypeId_: this.shipTypeId,
        }
    },
    watch: {
        shipTypeId (val) {
            this.shipTypeId_ = val;
        }
    },
    computed: {
        classes () {
            return {
                'solar-system-local-name': true,
                'solar-system-local-name-own': this.isOwn_
            }
        }
    }
}
</script>

<style lang="scss">
@import "/src/css/variables";
@import "~vue-material/dist/theme/engine";

$character-color-1: md-get-palette-color(orange, 500);

.solar-system-local-character {
    white-space: nowrap;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .ss-character-part {
        padding-right: 20px;
    }

    .solar-system-local-character__ticker {
        margin-left: 3px;
    }

    .solar-system-local-character__ship {
        margin-left: 5px;

        &.wd-ship-type {
            .wd-ship-type__name {
                font-size: 12px;
            }
        }
    }
}

.solar-system-local {
    .solar-system-local-name {
        font-weight: bold;
        color: #b1b1b1;
    }

    .solar-system-local-name.solar-system-local-name-own {
        color: $character-color-1;
    }

    .solar-system-local-ship {
        font-weight: bold;
    }
}
</style>