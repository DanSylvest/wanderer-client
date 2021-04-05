<template>
    <div class="wd-table-header-cell" @click="onSortableClicked">
        <template>
            <slot></slot>
        </template>

        <div
            v-show="lSortable"
            class="wd-table-header-cell__sort-button wd-bg-default"
            :class="sortClass"
        />
    </div>
</template>

<script>
    export default {
        name: "TableHeaderCell",
        props: {
            id: {
                type: String,
                default: ""
            },
            sortable: {
                type: Boolean,
                default: false
            },
            widthPolicy: {
                type: String,
                default: "auto"
            },
            sort : {
                type: String,
                default: "none"
            }
        },
        data: function () {
            return {
                lId: this.id,
                lWidthPolicy: this.widthPolicy,
                lSortable: this.sortable,
                lSort: this.sort,
            }
        },
        watch: {
            id (val) {
                this.lId = val;
            },
            widthPolicy (val) {
                this.lWidthPolicy = val;
            },
            sortable (val) {
                this.lSortable = val;
            },
            sort (val) {
                this.lSort = val;
            }
        },
        mounted() {
        },
        computed : {
            sortClass (){
                return sortClasses[this.lSort];
            }
        },
        methods: {
            onSortableClicked () {
                this.$emit("sorted");
            }
        }
    }

    const sortClasses = {
        "none": "not-sorted",
        "ascend": "ascend-sorted",
        "descend": "descend-sorted",
    }
</script>

<style lang="scss">
    .wd-table-header-cell {
        & > .wd-table-header-cell__sort-button {
            transform: rotateZ(0deg);
            position: absolute;
            left: 3px;
            background-image: url("/img/arrow.svg");
            width: 15px;
            height: 15px;

            transition: opacity 200ms, transform 200ms;

            &.not-sorted {
                opacity: 0;
            }

            &.descend-sorted {
                transform: rotateZ(180deg);
            }
        }

        &:hover {
            & > .wd-table-header-cell__sort-button {
                opacity: 1;
            }
        }
    }
</style>