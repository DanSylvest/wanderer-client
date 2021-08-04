<template>
    <div v-if="loadedShip" class="wd-ship-type">
        <div class="wd-ship-type__name">{{shipInfo.typeName}}</div>
        <div class="wd-ship-type__group" v-if="enableShipClass">{{shipInfo.groupName}}</div>
    </div>
</template>

<script>
    import ShipMixin from "../../mixins/ship.js";

    export default {
        name: "Ship",
        mixins: [ShipMixin],
        props: {
            enableShipClass: {
                type: Boolean,
                default: true
            }
        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .wd-ship-type {
        line-height: 1;
        display: flex;

        .wd-ship-type__name {
            font-size: 13px;
            color: $fg-primary;
            padding-right: 3px;
        }

        .wd-ship-type__group {
            font-size: 10px;
            color: $fg-primary-3;
        }
    }

</style>