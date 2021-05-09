import SpamFilter from "../../js/env/spamFilter.js";
import ServerStatusMixin from "./serverStatus.js";
import helper from "../../js/utils/helper.js";
import CustomPromise from "../../js/env/promise.js";

const EveSearchMixin = {
    mixins: [ServerStatusMixin],
    emits: {
        'changed': null
    },
    props: {
        items: {
            type: Array,
            default: () => []
        }
    },
    data: function () {
        return {
            lItems: this.items,
            elements: [],
            loading: false,

            currentValue: "",
            buttonDisabled: true,
            searchList: []
        }
    },
    mounted: function () {
        this._passChange = false;
        this._spamFilter = new SpamFilter(this._makeSearch.bind(this), 500);
        this._loadItems();
    },
    watch : {
        items (val) {
            this.lItems = val;
            this._loadItems();
        }
    },
    methods: {
        onACOpened: function (_event){
            this.onElementChanged(_event);

            setTimeout(function () {
                window.dispatchEvent(new Event('resize'));
            }.bind(this), 10)
        },
        onElementSelected: function (_event) {
            this._passChange = true;
            this._seletedItem = _event;
            this.buttonDisabled = false;
        },
        onElementChanged: function (/*_event*/) {
            if(this._passChange){
                this._passChange = false;
                return;
            }

            if(this.currentValue.length > 2) {
                let pr = new CustomPromise();
                this.searchList = pr.native
                this._spamFilter.call(this.currentValue, pr);
            } else {
                this.searchList = [];
            }
        },
        onElementAddButtonClicked: function (/*_event*/) {
            if(!this.elements.searchByObjectKey("id", this._seletedItem.id)) {
                this.elements.push(this._seletedItem);
                this.buttonDisabled = true;
                this.currentValue = "";
                this.$emit("changed", this.elements.map(x => x.id));
            }
        },
        onRowsSelected: function (_selectedGroups) {
            this.elementsSelected = _selectedGroups;
        },
        onDeleteRows: function () {
            for (let a = 0; a < this.elementsSelected.length; a++) {
                this.elements.eraseByObjectKey("id", this.elementsSelected[a].id);
            }
            this.elementsSelected = [];
        },
        _makeSearch: function (_match, _pr) {
            this._searchRequest(_match)
                .then(
                    _result => _pr.resolve(_result),
                    err => helper.errorHandler(this, err)
                )
        },
        _loadItems () {
            this.loading = true;
        },
        _loaded (x) {
            this.elements = x;
            this.loading = false;
        },
        _searchRequest (/*match*/) {
            // return api.eve.character.fastSearch({type: "byAll", match: match});
        },
        searchItemIcon (/*item*/) {
            // return 'https://images.evetech.net/corporations/' + item.id + '/logo';
        }
    }
}

export default EveSearchMixin;