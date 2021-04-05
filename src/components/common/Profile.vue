<template>
    <div class="wd padding-primary fs">
<!--        <md-empty-state-->
<!--            md-icon="biotech"-->
<!--            md-label="Unfortunately its not work!"-->
<!--            md-description="Coming soon..."-->
<!--        >-->
<!--        </md-empty-state>-->

        <wd-table :rows="myRows" selectable @selected="onSelected">
            <template v-slot:toolbar>Test header</template>

            <template v-slot:header>
                <table-header-cell sortable id="field1" widthPolicy="80px">field1</table-header-cell>
                <table-header-cell sortable id="field2">field2</table-header-cell>
                <table-header-cell sortable id="field3">field3</table-header-cell>
                <table-header-cell sortable id="field4">field4</table-header-cell>
            </template>

            <template v-slot:row="{row}">
                <table-cell id="field1">{{row.field1}}</table-cell>
                <table-cell id="field2">{{row.field2}}</table-cell>
                <table-cell id="field3">{{row.field3}}</table-cell>
                <table-cell id="field4">{{row.field4}}</table-cell>
            </template>

            <template v-slot:alternate-toolbar>
                <div class="md-toolbar-section-start">Alliances selected - 1</div>

                <div class="md-toolbar-section-end">
                    <md-button class="md-icon-button">
                        <md-icon>delete</md-icon>
                    </md-button>
                </div>
            </template>
        </wd-table>
    </div>
</template>

<script>
    import WdTable from "../ui/Table/WdTable.vue";
    import TableHeaderCell from "../ui/Table/TableHeaderCell.vue";
    import TableCell from "../ui/Table/TableCell.vue";

    let counter = 0;
    export default {
        name: "Profile",
        components: {WdTable, TableHeaderCell, TableCell},
        props: [],
        data: function () {
            return {
                myRows: [
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                    {field1: "kek" + (counter++), field2: "lol" + (counter++), field3: "test" + (counter++), field4: "qwe" + (counter++)},
                ]
            }
        },
        mounted () {

        },
        methods: {
            // eslint-disable-next-line no-unused-vars
            onSelected (data) {
                // eslint-disable-next-line no-debugger
                debugger
            },
            refresh: function () {

            }
        }
    }
</script>
