const modules = {
    home: {
        isProtected: true,
        isComponent: true,
        componentName: "Home",
        path: "pages/Home"
    },
    ssoAuthResponse: {
        isProtected: true,
        isComponent: false,
        path: "scripts/ssoAuthResponse"
    },
    login: {
        isProtected: false,
        isComponent: true,
        componentName: "Login",
        path: "pages/Login"
    },
    ssoAuthResponseForLogin: {
        isProtected: false,
        isComponent: false,
        path: "scripts/ssoAuthResponseForLogin"
    },
    currentMap: {
        isProtected: true,
        isComponent: true,
        componentName: "CurrentMap",
        path: "common/CurrentMap"
    },
    characters: {
        isProtected: true,
        isComponent: true,
        componentName: "Characters",
        path: "common/Characters"
    }
}

module.exports = modules;