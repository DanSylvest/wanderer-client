<template>
    <div class="wd-groups wd padding-primary" >
        <AllowedGroups ref="allowedGroupsRef"></AllowedGroups>
    </div>
</template>

<script>
    import AllowedGroups from "./groups/AllowedGroups";

    export default {
        name: "Groups",
        components: {
             AllowedGroups
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
            refresh: function () {

            }
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
