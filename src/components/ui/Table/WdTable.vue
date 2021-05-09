<template>
    <div class="wd-table wd fs relative" v-show="isDisplay">
        <transition name="wd-table-alternate-toolbar__fade">
            <div class="wd-table-alternate-toolbar" :class="{'wd-toolbar-short': isShortToolbar}" v-if="hasSelected">
                <slot name="alternate-toolbar"></slot>
            </div>
        </transition>

        <div class="wd-outer-table wd fs relative">
            <div class="wd-table-toolbar">
                <div v-if="hasToolbar" class="wd fs">
                    <slot name="toolbar"></slot>
                </div>
            </div>
            <div class="wd fs relative wd-table-content-wrapper">
                <div class="wd-table-content" :class="{'wd-table-borders': lEnableBorders}" v-show="!isEmptyStateActive">
                    <table-header-cell v-if="selectable" width-policy="40px" class="wd-check-header-cell">
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
                        <div class="wd fs" >
                            <slot name="empty-state"></slot>
                        </div>
                    </template>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    import TableCell from "./TableCell.vue";
    import TableHeaderCell from "./TableHeaderCell.vue";
    import extend from "../../../js/env/tools/extend.js";
    import exists from "../../../js/env/tools/exists.js";

    /**
     * also you can use classes to wd-table
     *  - no-cell-hover - will turn off row hovering
     *  - text-centering - will centering text in cells
     *  - nowrap-cells - will nowrap text in cells
     */
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
            },
            sortCol : {
                type: String,
                default: null
            },
            sortOrder : {
                type: String,
                default: "none"
            },
            activeRows : {
                type: Array,
                default: () => []
            },
            suppressContext : {
                type: Boolean,
                default: true
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
                currentSortHeader: this.sortCol,
                currentSortOrder: this.sortOrder,
                lActiveRows: this.activeRows
            }
        },
        watch: {
            rows (val) {
                removeCellsHandlers.call(this);
                this.lRows = val;
                this.updateSelectedCheckboxes();
                this.$nextTick(updateHandlersForSlots.bind(this));
                updateActive.call(this);
            },
            enableHeaders (val) {
                this.lEnableHeaders = val;
            },
            enableBorders (val) {
                this.lEnableBorders = val;
            },
            sortCol (val) {
                this.currentSortHeader = val;
            },
            sortOrder (val) {
                this.currentSortOrder = val;
            },
            activeRows (val) {
                this.lActiveRows = val;
                updateActive.call(this);
            }
        },
        updated() {
            updateActive.call(this);
        },
        mounted() {
            this.rowClickHandler = onRowClicked.bind(this);
            this.rowContextHandler = onRowContext.bind(this);

            getTable(this.$el).classList.add(`wd-table-cols-${countOfColumns.call(this)}`);

            this.updateSelectedCheckboxes();
            calculateColumns.call(this);
            upgradeSortableHeaders.call(this);
            updateHandlersForSlots.call(this);
            updateActive.call(this);

            this.isDisplay = true;
        },
        computed : {
            hasToolbar() {
                return !!this.$slots.toolbar;
            },
            hasAlternateToolbar() {
                return !!this.$slots['alternate-toolbar'];
            },
            hasEmptyState() {
                return !!this.$slots['empty-state'];
            },
            isEmptyStateActive () {
                return this.hasEmptyState && this.rows.length === 0;
            },
            isShortToolbar () {
                return this.selectable && !this.hasToolbar;
            },
            updatedRows () {
                return this.lRows.map(x => extend(x, {
                    __uid : counter++
                }))
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
                return this.hasAlternateToolbar && selected.length > 0;
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
        TABLE_CELL: "wd-table-cell",
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

    const updateActive = function () {
        let colCount = countOfColumns.call(this);
        let cells = getCellsEl.call(this);

        for (var colIndex = 0; colIndex < cells.length; colIndex++) {
            if(colIndex % colCount === 0) {
                cells[colIndex].classList.remove("active");
            }
        }

        this.lActiveRows.map(x => {
            let index = this.sortedRows.indexOf(x);
            let colIndex = colCount * index;
            cells[colIndex].classList.add("active");
        });
    }

    const removeCellsHandlers = function () {
        let cells = getCells.call(this);
        cells.map(x => x.$off("clicked", this.rowClickHandler));
        cells.map(x => x.$off("context", this.rowContextHandler));
    }

    const updateHandlersForSlots = function () {
        let cells = getCells.call(this);
        cells.map(x => x.$on("clicked", this.rowClickHandler));
        cells.map(x => x.$on("context", this.rowContextHandler));
    }

    const onRowClicked = function (event) {
        let data = getRowData.call(this, event.currentTarget);
        !!data && this.$emit("row-clicked", {originalEvent: event, data});
    }

    const onRowContext = function (event) {
        if(this.suppressContext) {
            event.preventDefault();
        }

        let data = getRowData.call(this, event.currentTarget);
        !!data && this.$emit("row-context", {originalEvent: event, data});
    }

    const getRowData = function (cellElement) {
        let colCount = countOfColumns.call(this);
        let cells = getCellsEl.call(this);
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
            if(cells[cellIndex] === cellElement) {
                let rowIndex = (cellIndex - cellIndex % colCount) / colCount;
                return this.sortedRows[rowIndex];
            }
        }

        return null;
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
            if (exists(x.$el.classList) && x.$el.classList.contains(classes.TABLE_HEADER_CELL) && x.$data.lSortable)
                sortableHeaders.push(x);
        });

        return sortableHeaders;
    }

    const getCellsEl = function () {
        let out = [];

        let el = this.$el.querySelector('.wd-table-content');

        for (let a = 0; a < el.children.length; a++) {
            if (exists(el.children[a].classList) && el.children[a].classList.contains(classes.TABLE_CELL))
                out.push(el.children[a]);
        }

        return out;
    }

    const getCells = function () {
        let out = [];

        this.$children.map(x => {
            if (exists(x.$el.classList) && x.$el.classList.contains(classes.TABLE_CELL))
                out.push(x);
        });

        return out;
    }

    const calculateColumns = function () {
        let colsTemplate = [];

        this.$children.map(x => {
            if (exists(x.$el.classList) && x.$el.classList.contains(classes.TABLE_HEADER_CELL))
                colsTemplate.push(x.$data.lWidthPolicy);
        });

        getTable(this.$el).style['grid-template-columns'] = colsTemplate.join(" ");
    }

    const countOfColumns = function () {
        let colsTemplate = [];

        this.$children.map(x => {
            if (exists(x.$el.classList) && x.$el.classList.contains(classes.TABLE_HEADER_CELL))
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
    $toolbar-height: 50px;

    .wd-table.wd-cell-padding-primary {
        & > .wd-outer-table {
            & > .wd-table-content-wrapper {
                & > .wd-table-content {
                    .wd-table-cell, .wd-table-header-cell {
                        padding: 0 10px;
                    }
                }
            }
        }
    }

    .wd-outer-table {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: auto auto 1fr;
        z-index: 0;

        & > div {
            background-color: $bg-transparent;
        }

        & > div > .fade {
            &-enter-active, &-leave-active {
                position: absolute;
                top: 40px;
            }
        }
    }

    .wd-table-content-wrapper {
        overflow-x: hidden;
        overflow-y: auto;


        &::-webkit-scrollbar {
            width: 8px;
        }

        &::-webkit-scrollbar:hover {}

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

    .wd-table.no-cell-hover .wd-table-content {
        & > .wd-table-cell {
            cursor: initial !important;
        }

        & > .wd-table-cell:hover::before, {
            background-color: initial !important;
        }

        & > .wd-table-cell:active::before, {
            background-color: initial !important;
        }

    }

    .wd-table.text-centering .wd-table-content
    {
        & > .wd-table-cell > .wd-table-cell__content,
        & > .wd-table-header-cell > .wd-table-cell__content,
        {
            text-align: center;
        }
    }

    .wd-table.nowrap-cells .wd-table-content
    {
        & > .wd-table-cell > .wd-table-cell__content,
        & > .wd-table-header-cell > .wd-table-cell__content,
        {
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }

    .wd-table-content {
        display: grid;
        line-height: initial;
        align-items: center;
        position: relative;

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
        }

        &.wd-table-borders > .wd-table-header-cell {
            border-bottom: 1px solid $border-color-primary-6;
        }

        &.wd-table-borders > .wd-table-header-cell:hover {
            border-bottom: 1px solid $border-color-primary-3;
        }

        & > .wd-table-header-cell {
            color: $fg-theme-primary-solid;
        }

        & > .wd-table-cell,
        & > .wd-table-header-cell {
            position: relative;
            display: flex;
            box-sizing: border-box;
            justify-content: center;
            align-items: center;
            min-height: $row-height;
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

        & > .wd-table-cell.active::before, {
            background-color: $fg-theme-primary;
        }
    }

    .wd-table-toolbar {
        font-size: 13pt;
        background-color: $bg-secondary-2;

        & > div {
            display: flex;
            align-items: center;
            box-sizing: border-box;
        }
    }

    .wd-table-toolbar,
    .wd-table-toolbar > div,
    .wd-table-alternate-toolbar
    {
        display: flex;
        align-items: center;
        padding: 10px 10px;
        height: $toolbar-height;
    }

    .wd-table-alternate-toolbar {
        position: absolute;

        background-color: $bg-3;

        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        opacity: 1;

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