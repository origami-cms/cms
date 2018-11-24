// Default server plugins

export const defaultPlugins = {
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
