const modules = {
    home: {
        isProtected: true,
        isComponent: true,
        componentName: "Home",
        path: "pages/Home"
    },
    login: {
        isProtected: false,
        isComponent: true,
        componentName: "Login",
        path: "pages/Login"
    },
    ssoAuth: {
        isProtected: false,
        isComponent: false,
        path: "scripts/ssoAuth"
    },
    currentMap: {
        isProtected: true,
        isComponent: true,
        componentName: "CurrentMap",
        path: "common/CurrentMap/CurrentMap"
    },
    characters: {
        isProtected: true,
        isComponent: true,
        componentName: "Characters",
        path: "common/Characters"
    },
    profile: {
        isProtected: true,
        isComponent: true,
        componentName: "Profile",
        path: "common/Profile"
    },
    maps: {
        isProtected: true,
        isComponent: true,
        componentName: "Maps",
        path: "common/Maps/Maps"
    },
    groupsOwn: {
        isProtected: true,
        isComponent: true,
        componentName: "GroupsOwn",
        path: "common/GroupsOwn"
    },
    groupsAllowed: {
        isProtected: true,
        isComponent: true,
        componentName: "GroupsAllowed",
        path: "common/GroupsAllowed"
    }
}

module.exports = modules;