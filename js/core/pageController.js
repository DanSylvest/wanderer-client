
(function () {
    var moduleName = "core/pageController";

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "utils/log",
        "env/tools/emitter",
        "env/cookie",
        "env/tools/exist",
        "env/promise",
        "env/query",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var extend       = require("env/tools/extend");
        var log          = require("utils/log");
        var Emitter      = require("env/tools/emitter");
        var cookie       = require("env/cookie");
        var exist        = require("env/tools/exist");
        var promise      = require("env/promise");
        var locQuery     = require("env/query");

        var PageController = classCreator("PageController", Emitter, {
            constructor: function connector(_options) {
                var base = extend({
                    query: "",
                    loginPage: "login",
                    homePage: "home",
                    errorPage: "notFound"
                }, _options);

                Emitter.prototype.constructor.call(this);

                this.isLogged = false;

                this.query = base.query;
                this.loginPage = base.loginPage;
                this.homePage = base.homePage;
                this.errorPage = base.errorPage;
                this.state = -1;
            },
            run: function () {
                this._loadingPromise = new promise();

                this._nextState(ST_OPEN);

                return this._loadingPromise.native;
            },
            _nextState: function (_state, _options) {
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
            },
            _checkLogin: function () {
                var token = cookie.get("token");
                if(exist(token)) {
                    window.api.user.checkToken(token).then(function() {
                        this.isLogged = true;
                        this._nextState(ST_CHECK_PROTECT_PAGE);
                    }.bind(this), function() {
                        cookie.remove("token");
                        this._nextState(ST_CHECK_FIRST_TIME);
                    }.bind(this));
                } else {
                    this._nextState(ST_CHECK_FIRST_TIME);
                }
            },
            _checkFirstTime: function () {
                this._nextState(ST_CHECK_PROTECT_PAGE);
                /*var isFirstTime = cookie.get("isFirstTime");
                if(exist(isFirstTime)) {
                    if(isFirstTime === "true" || isFirstTime === "false") {
                        if(isFirstTime === "true") { // this case means that someone already was on site
                            this._nextState(ST_CHECK_PROTECT_PAGE);
                        } else {                     // this case say us that user first time on site
                            this._nextState(ST_GO_TO_LOGIN_PAGE)
                        }
                    } else {
                        throw "Exception: 'this is some shit' - somebody set invalid value inside 'isFirstTime' cookie";
                    }
                } else {
                    // вот точно первый раз
                    this._nextState(ST_GO_TO_LOGIN_PAGE);
                }*/
            },
            checkProtectPage: function () {
                var query = locQuery.parse(location.search.substring(1, location.search.length));
                if(exist(query.page)) {
                    window.api.page.isProtect(query.page).then(function(_isProtect) {
                        if(_isProtect) {
                            if(this.isLogged) {
                                this._nextState(ST_GO_TO_PAGE, query.page);
                            } else {
                                this._nextState(ST_GO_TO_LOGIN_PAGE);
                            }
                        } else {
                            this._nextState(ST_GO_TO_PAGE, query.page);
                        }
                    }.bind(this), function() {
                        this._nextState(ST_GO_TO_ERROR_PAGE);
                    }.bind(this));
                } else {
                    this._nextState(this.isLogged ? ST_GO_TO_HOME_PAGE : ST_GO_TO_LOGIN_PAGE);
                }
            }
        });

        var counter = 0;

        var ST_OPEN = counter++;
        var ST_CHECK_FIRST_TIME = counter++;
        var ST_CHECK_PROTECT_PAGE = counter++;
        var ST_GO_TO_LOGIN_PAGE = counter++;
        var ST_GO_TO_HOME_PAGE = counter++;
        var ST_GO_TO_PAGE = counter++;
        var ST_GO_TO_ERROR_PAGE = counter++;

        return PageController;
    })
})();