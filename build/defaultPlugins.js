"use strict";
// Default server plugins
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    favicon: true,
    auth: true,
    // Setup screen
    setup: true,
    'core-api': true,
    'user-profiles': true,
    media: {
        provider: 'filesystem',
        location: './media'
    },
    'default-pages': true
};
