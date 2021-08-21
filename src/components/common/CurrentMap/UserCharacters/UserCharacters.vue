<template>
    <div class="wd-user-characters">
        <div
            class="wd-characters-icons wd-bg-default"
            :class="{'character-online': item.online}"
            v-for="item in userCharactersList"
            :style="getCharImageUrlStyle(item.charId)"
            :key="item.charId"
        >
            <tooltip placement="bottom" :customPosition="false" class="wd wd-layout-secondary md-elevation-2">
                <character-card :map-id="mapId_" :character-id="item.charId"/>
            </tooltip>
        </div>
    </div>
</template>

<script>
    import Tooltip from "../../../ui/Tooltip";
    import CharacterCard from "../CharacterCard";
    import {UserCharactersMixin} from "./mixins/userCharacters";
    import {getCharImageUrlStyle} from "../../../utils/eveResources";

    export default {
        name: "UserCharacters",
        components: {Tooltip, CharacterCard},
        mixins: [UserCharactersMixin],
        methods: {
            getCharImageUrlStyle
        }
    }
</script>

<style scoped lang="scss">
.wd-user-characters {
    width: 100%;
    height: 100%;
    padding-right: 5px;

    display: flex;
    justify-content: flex-end;

    *:not(:last-child) {
        margin-right: 5px;
    }
}
</style>