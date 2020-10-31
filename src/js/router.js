import extend from "./env/tools/extend";
import exists from "./env/tools/exists";
import cookie from "./env/cookie";
import query from "./env/query";
import modules from "./../conf/modules";
import Emitter from "./env/tools/emitter";
import CustomPromise from "./env/promise";
import api from "./api";

let counter = 0;
const ST_OPEN = counter++;
const ST_CHECK_FIRST_TIME = counter++;
const ST_CHECK_PROTECT_PAGE = counter++;
const ST_GO_TO_LOGIN_PAGE = counter++;
const ST_GO_TO_HOME_PAGE = counter++;
const ST_GO_TO_PAGE = counter++;
const ST_GO_TO_ERROR_PAGE = counter++;

class Router extends Emitter {
    constructor(_options) {
        super();

        let base = extend({
            query: "",
            loginPage: "login",
            homePage: "home",
            errorPage: "notFound"
        }, _options);

        this.query = base.query;
        this.loginPage = base.loginPage;
        this.homePage = base.homePage;
        this.errorPage = base.errorPage;
        this.isLogged = false;
        this.state = -1;
    }

    destructor() {
        this.isLogged = false;
        this.state = -1;

        super.destructor();
    }

    run() {
        this._loadingPromise = new CustomPromise();

        this._nextState(ST_OPEN);

        return this._loadingPromise.native;
    }

    _nextState(_state, _options) {
        switch (_state) {
            case ST_OPEN:
                this._checkLogin();
                break;
            case ST_CHECK_FIRST_TIME:
                this._checkFirstTime();
                break;
            case ST_CHECK_PROTECT_PAGE:
                this.checkProtectPage();
                break;
            case ST_GO_TO_LOGIN_PAGE:
                this._loadingPromise.resolve({
                    page: this.loginPage
                });
                break;
            case ST_GO_TO_HOME_PAGE:
                this._loadingPromise.resolve({
                    page: this.homePage
                });
                break;
            case ST_GO_TO_ERROR_PAGE:
                this._loadingPromise.resolve({
                    page: this.errorPage
                });
                break;
            case ST_GO_TO_PAGE:
                this._loadingPromise.resolve({
                    page: _options
                });
                break;
        }

        this.state = _state;
    }

    _checkLogin() {
        let token = cookie.get("token");
        if(exists(token)) {
            api.user.checkToken(token).then(function() {
                this.isLogged = true;
                this._nextState(ST_CHECK_PROTECT_PAGE);
            }.bind(this), function() {
                cookie.remove("token");
                this._nextState(ST_CHECK_FIRST_TIME);
            }.bind(this));
        } else {
            this._nextState(ST_CHECK_FIRST_TIME);
        }
    }

    _checkFirstTime() {
        this._nextState(ST_CHECK_PROTECT_PAGE);
    }

    checkProtectPage() {
        let data = query.parse(location.search.substring(1, location.search.length));
        if(exists(data.page)) {
            if(modules[data.page].isProtected){
                if(this.isLogged) {
                    this._nextState(ST_GO_TO_PAGE, data.page);
                } else {
                    this._nextState(ST_GO_TO_LOGIN_PAGE);
                }
            } else {
                this._nextState(ST_GO_TO_PAGE, data.page);
            }
        } else {
            this._nextState(this.isLogged ? ST_GO_TO_HOME_PAGE : ST_GO_TO_LOGIN_PAGE);
        }
    }
}

export default Router;