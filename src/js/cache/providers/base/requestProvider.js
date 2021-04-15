import helper from "../../../utils/helper.js";
import DataProvider from "./dataProvider.js";

class RequestProvider extends DataProvider {
    constructor() {
        super();
    }

    _initRequest() {
        this._createRequest()
            .then(
                this._eventHandler.bind(this),
                err => helper.errorHandler(err)
            )
    }

    _createRequest () {
        throw `Error - _createRequest should be overrides`;
    }

    _eventHandler(event) {
        super._eventHandler(event);
        this._readyPromise.resolve();
        this.emit("changedEvent", event);
    }
}

export default RequestProvider;