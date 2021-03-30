<template>
    <div class="wd-groups wd padding-primary">
        <OwnGroups ref="ownGroupsRef" ></OwnGroups>
    </div>
</template>

<script>
    import OwnGroups from "./groups/OwnGroups";

    export default {
        name: "Groups",
        components: {
            OwnGroups
        },
        props: [],
        data: function () {
            return {
                groups: [],
            }
        },
        mounted: function () {

        },
        methods: {
            refresh: function () {}
        }
    }
</script>

<style lang="scss">
    .wd-groups {
        & > .md-card {
            max-width: 900px;
            border-radius: 4px;
            overflow: hidden;
        }

        .md-tabs.md-alignment-left .md-tabs-navigation {
            display: flex;
            justify-content: center;
        }
    }
</style>
