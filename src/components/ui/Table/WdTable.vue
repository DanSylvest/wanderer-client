<template>
    <div class="wd-table wd fs relative" v-show="isDisplay">
        <transition name="wd-table-alternate-toolbar__fade">
            <div class="wd-table-alternate-toolbar" :class="{'wd-toolbar-short': isShortToolbar}" v-if="hasSelected">
                <slot name="alternate-toolbar"></slot>
            </div>
        </transition>

        <div class="wd-outer-table wd fs relative">
            <div class="wd-table-toolbar">
                <div v-if="hasToolbar" class="">
                    <slot name="toolbar"></slot>
                </div>
            </div>
            <div class="wd fs relative wd-table-content-wrapper" >
                <div class="wd-table-content" :class="{'wd-table-borders': lEnableBorders}">
                    <table-header-cell v-if="selectable" width-policy="40px" >
                        <md-checkbox v-model="globalSelect" @change="onGlobalCheckboxChanged" />
                    </table-header-cell>
                    <slot name="header"></slot>

                    <template v-for="item in sortedRows">
                        <table-cell v-if="selectable" label="kek" :key="item.__uid">
                            <md-checkbox v-model="selected[item.__uid]" @change="onRowCheckboxChanged($event, item.__uid)"/>
                        </table-cell>
                        <slot name="row" v-bind:row="item"></slot>
                    </template>
                </div>
            </div>
            <div>
                <transition name="fade">
                    <template v-if="isEmptyStateActive">
                        <div class="wd fs absolute top"/>
                        <slot name="empty-state"></slot>
                    </template>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    import TableCell from "./TableCell.vue";
    import TableHeaderCell from "./TableHeaderCell.vue";

    export default {
        name: "WdTable",
        components: { TableCell, TableHeaderCell },
        props: {
            rows: {
                type: Array,
                default: () => []
            },
            enableHeaders: {
                type: Boolean,
                default: true
            },
            enableBorders : {
                type: Boolean,
                default: true
            },
            selectable : {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                lRows: this.rows,
                lEnableHeaders: this.enableHeaders,
                lEnableBorders: this.enableBorders,
                isDisplay: false,
                globalSelect: false,
                selected: Object.create(null),
                lastSortedHeader: null,
                currentSortHeader: null,
                currentSortOrder: "none"
            }
        },
        watch: {
            rows (val) {
                this.lRows = val;
                this.updateSelectedCheckboxes();
            },
            enableHeaders (val) {
                this.lEnableHeaders = val;
            },
            enableBorders (val) {
                this.lEnableBorders = val;
            }
        },
        mounted() {
            this.updateSelectedCheckboxes();
            calculateColumns.call(this);
            upgradeSortableHeaders.call(this);

            getTable(this.$el).classList.add(`wd-table-cols-${countOfColumns.call(this)}`);

            this.isDisplay = true;
        },
        computed : {
            hasToolbar() {
                return !!this.$slots.toolbar;
            },
            hasEmptyState() {
                return !!this.$slots['empty-state'];
            },
            isEmptyStateActive () {
                return this.rows.length === 0 && this.hasEmptyState
            },
            isShortToolbar () {
                return this.selectable && !this.hasToolbar;
            },
            updatedRows () {
                return this.lRows.map(x => ({...x, __uid : counter++}))
            },
            sortedRows () {
                if(this.currentSortHeader !== null && this.currentSortHeader !== "none" && this.currentSortOrder !== "none") {
                    let sortMethod = this.currentSortOrder === "descend" ? DESC : ASC;
                    return [...this.updatedRows].sort(sortMethod.bind(null, this.currentSortHeader));
                }

                return [...this.updatedRows];
            },
            hasSelected () {
                let selected = this.sortedRows.filter(x => this.selected[x.__uid]);
                return selected.length > 0;
            }
        },
        methods : {
            updateSelectedCheckboxes () {
                let out = Object.create(null);
                this.sortedRows.map(x => out[x.__uid] = false);
                this.selected = out;
            },
            onGlobalCheckboxChanged (val) {
                Object.keys(this.selected).map(x => this.selected[x] = val)
                this.notifySelected();
            },
            onRowCheckboxChanged (val, id) {
                this.selected[id] = val
                this.notifySelected();
            },
            notifySelected () {
                let selected = this.sortedRows.filter(x => this.selected[x.__uid]);

                selected = selected.map(x => {
                    let out = {...x};
                    delete out.__uid;
                    return out;
                });

                this.$emit("selected", selected);
            }

        }
    }

    const classes = {
        TABLE: "wd-table-content",
        TABLE_HEADER_CELL: "wd-table-header-cell",
    }

    let counter = 0;

    const ASC = (id, a, b) => {
        if(a[id] > b[id]) {
            return 1;
        } else if(a[id] < b[id]) {
            return -1;
        } else {
            return 0;
        }
    }

    const DESC = (id, a, b) => {
        if(a[id] < b[id]) {
            return 1;
        } else if(a[id] > b[id]) {
            return -1;
        } else {
            return 0;
        }
    }

    const upgradeSortableHeaders = function () {
        getSortableHeaders.call(this).map(x => x.$on("sorted", onHeaderSorted.bind(this, x)))
    }

    const onHeaderSorted = function (header) {
        if(!this.lastSortedHeader || (header.lId !== this.lastSortedHeader.lId)) {
            if(this.lastSortedHeader)
                this.lastSortedHeader.lSort = "none";

            this.lastSortedHeader = header;
            this.lastSortedHeader.lSort = "ascend";
            this.currentSortHeader = header.lId;
            this.currentSortOrder = this.lastSortedHeader.lSort
        } else {
            switch (this.lastSortedHeader.lSort) {
                case "ascend":
                    this.lastSortedHeader.lSort = "descend";
                    break;
                case "descend":
                    this.lastSortedHeader.lSort = "none";
                    break;
                case "none":
                    this.lastSortedHeader.lSort = "ascend";
                    break;
            }
            this.currentSortOrder = this.lastSortedHeader.lSort
        }

    }

    const getSortableHeaders = function () {
        let sortableHeaders = [];

        this.$children.map(x => {
            if (x.$el.classList.contains(classes.TABLE_HEADER_CELL) && x.$data.lSortable)
                sortableHeaders.push(x);
        });

        return sortableHeaders;
    }

    const calculateColumns = function () {
        let colsTemplate = [];

        this.$children.map(x => {
            if (x.$el.classList.contains(classes.TABLE_HEADER_CELL))
                colsTemplate.push(x.$data.lWidthPolicy);
        });

        getTable(this.$el).style['grid-template-columns'] = colsTemplate.join(" ");
    }

    const countOfColumns = function () {
        let colsTemplate = [];

        this.$children.map(x => {
            if (x.$el.classList.contains(classes.TABLE_HEADER_CELL))
                colsTemplate.push(x.$data.lWidthPolicy);
        });

        return colsTemplate.length;
    }

    const getTable = function (el) {
        return el.querySelector("." + classes.TABLE);
    }

</script>

<style lang="scss">
    @import "/src/css/variables";
    $row-width: 40px;
    $row-height: 40px;

    .wd-outer-table {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: auto auto 1fr;
        z-index: 0;

        & > div {
            background-color: $bg-transparent;
        }
    }

    .wd-table-content-wrapper {
        overflow-x: hidden;
        overflow-y: auto;


        &::-webkit-scrollbar {
            width: 8px;
        }

        &::-webkit-scrollbar:hover {

        }

        &::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.0);
        }

        &::-webkit-scrollbar-thumb {
            transition: background-color 200ms;
            width: 8px;
            border-radius: 3px;
            background-color: rgba(158, 140, 140, 0.5);
        }

        &::-webkit-scrollbar-thumb:hover {
            background-color: rgba(205, 166, 87, 0.5);
        }
    }

    .wd-table-content {
        display: grid;
        line-height: initial;
        align-items: center;
        position: relative;
        background-color: $bg-secondary;

        @for $i from 1 through 30 {
            &.wd-table-borders.wd-table-cols-#{$i} > .wd-table-header-cell:not(:nth-child(#{$i})),
            &.wd-table-borders.wd-table-cols-#{$i} > .wd-table-cell:not(:nth-child(#{$i}n+#{$i * 2})),
            {
                border-right: 1px solid $border-color-primary-6;
            }

            &.wd-table-borders.wd-table-cols-#{$i} > .wd-table-cell:nth-last-child(n + #{$i + 1}),
            {
                border-bottom: 1px solid $border-color-primary-6;
            }

            &.wd-table-borders.wd-table-cols-#{$i} > .wd-empty-row {
                grid-column-start: 1;
                grid-column-end: $i;
            }
        }

        &.wd-table-borders > .wd-table-cell,
        &.wd-table-borders > .wd-table-header-cell {
            transition: background-color 150ms, border-bottom-color 150ms;
            background-color: $bg-transparent;
        }

        &.wd-table-borders > .wd-table-header-cell {
            border-bottom: 1px solid $border-color-primary-5;
        }

        &.wd-table-borders > .wd-table-header-cell:hover {
            background-color: $border-color-primary-5;
            border-bottom: 1px solid $border-color-primary-3;
        }

        &.wd-table-borders > .wd-table-cell:hover {
            background-color: $border-color-primary-5-2;
        }

        & > .wd-table-cell, {
            background-color: $bg-primary;
        }


        & > .wd-table-cell,
        & > .wd-table-header-cell {
            position: relative;
            display: flex;
            box-sizing: border-box;
            justify-content: center;
            align-items: center;
            /*height: $row-height;*/
            min-height: $row-height;
            /*padding: 5px;*/
            cursor: pointer;

            & .md-checkbox {
                margin: initial;
                .md-checkbox-container::before {
                    display: none;
                }

                .md-checkbox-container .md-ripple {
                    width: $row-width !important;
                    height: $row-height !important;
                }

                .md-checkbox-container {
                    width: 17px;
                    min-width: 17px;
                    height: 17px;
                }
                .md-checkbox-container:after {
                    top: -1px;
                    left: 4px;
                }
            }
        }

        & > .wd-table-cell > .wd-table-cell__content,
        & > .wd-table-header-cell > .wd-table-cell__content,
        {
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            height: 100%;
        }

/*        & > .wd-table-cell::after, {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            cursor: pointer;
            top: 0;
            left: 0;
        }*/

        & > .wd-table-cell::before, {
            pointer-events: none;
            content: "";
            position: absolute;
            z-index: 1;
            background-color: rgba(0,0,0,0);
            transition: background-color 150ms;
        }

        & > .wd-table-cell::before, {
            top: 0;
            bottom: 0;
            right: -10000%;
            left: -10000%;
        }

        & > .wd-table-cell:hover::before, {
            background-color: transparentize($bg-3, 0.45);
        }

        & > .wd-table-cell:active::before, {
            background-color: transparentize($bg-3-major, 0.45);
        }


    }

    .wd-table-toolbar {
        background-color: $bg-secondary-2;

        & > div {
            display: flex;
            align-items: center;
            box-sizing: border-box;

            padding: 0 10px;
            height: $row-height;
        }
    }

    .wd-table-alternate-toolbar {
        display: flex;
        align-items: center;
        position: absolute;

        background-color: $bg-3;
        height: $row-height;

        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        opacity: 1;
        padding: 0 10px;

        &.wd-toolbar-short {
            width: calc(100% - #{$row-width});
            left: $row-width;
        }
    }

    .wd-table-alternate-toolbar__fade {
        &-enter-active, &-leave-active {
            transition: opacity 300ms;
        }

        &-enter, &-leave-to {
            opacity: 0;
        }

        &-enter-to, &-leave {
            opacity: 1;
        }
    }

</style>