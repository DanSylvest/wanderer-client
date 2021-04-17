<template>
    <div v-if="loadedShip" class="wd-ship-type">
        <span class="wd-ship-type__name">{{shipInfo.typeName}}</span>&nbsp;
        <span class="wd-ship-type__group">{{shipInfo.groupName}}</span>
    </div>
</template>

<script>
    import ShipMixin from "../../mixins/ship.js";

    export default {
        name: "Ship",
        mixins: [ShipMixin],
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .wd-ship-type {

        .wd-ship-type__name {
            font-size: 14px;
            color: $fg-primary;
        }

        .wd-ship-type__group {
            font-size: 11px;
            color: $fg-primary-2;
        }
    }

</style>