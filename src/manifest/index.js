const pkg = require('../../package.json');

const manifestInput = {
    manifest_version: 2,
    name: 'Kutt',
    version: pkg.version,

    short_name: 'Kutt',
    description: 'Shorten long URLs with just one click.',
    icons: {
        '16': 'assets/favicon-16.png',
        '32': 'assets/favicon-32.png',
        '48': 'assets/favicon-48.png',
        '128': 'assets/favicon-128.png',
    },
    homepage_url: 'https://github.com/abhijithvijayan/kutt-extension',

    __firefox__browser_specific_settings: {
        gecko: {
            id: 'support@kutt.it',
            strict_min_version: '52.0',
        },
    },

    '__chrome|firefox__author': 'abhijithvijayan',
    __opera__developer: {
        name: 'abhijithvijayan',
    },
    browser_action: {
        default_popup: 'popup.html',
        default_icon: {
            '16': 'assets/favicon-16.png',
            '32': 'assets/favicon-32.png',
            '48': 'assets/favicon-48.png',
            '128': 'assets/favicon-128.png',
        },
        default_title: 'Shorten this URL',
        '__chrome|opera__chrome_style': false,
        __firefox__browser_style: false,
    },

    background: {
        '__chrome|opera__persistent': false,
        scripts: ['js/background.bundle.js'],
    },

    __chrome__minimum_chrome_version: '49',
    __opera__minimum_opera_version: '36',

    '__chrome|opera__permissions': ['activeTab', 'storage', 'clipboardRead', 'http://*/*', 'https://*/*'],
    __firefox__permissions: ['activeTab', 'storage', 'clipboardWrite', 'clipboardRead', 'http://*/*', 'https://*/*'],

    content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",

    '__chrome|opera__options_page': 'options.html',
    options_ui: {
        page: 'options.html',
        open_in_tab: true,
        __chrome__chrome_style: false,
        '__firefox|opera__browser_style': false,
    },
};

module.exports = manifestInput;
