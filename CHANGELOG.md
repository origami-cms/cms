# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.3-alpha.8](https://github.com/origami-cms/cms/compare/v0.0.3-alpha.7...v0.0.3-alpha.8) (2018-12-12)


### Bug Fixes

* **cli:** readded files in cli npm dist ([e052e70](https://github.com/origami-cms/cms/commit/e052e70))





## [0.0.3-alpha.7](https://github.com/origami-cms/cms/compare/v0.0.3-alpha.6...v0.0.3-alpha.7) (2018-12-12)


### Bug Fixes

* **cli:** fixed broken new command ([38cd2c0](https://github.com/origami-cms/cms/commit/38cd2c0))
* **core-server:** fixed content-type on app icons and public ([82eb4dd](https://github.com/origami-cms/cms/commit/82eb4dd))


### Features

* **core-lib:** case sensitive env params ([1d51005](https://github.com/origami-cms/cms/commit/1d51005))
* adding tags to publish ([56f618c](https://github.com/origami-cms/cms/commit/56f618c))





## [0.0.3-alpha.6](https://github.com/origami-cms/cms/compare/v0.0.3-alpha.5...v0.0.3-alpha.6) (2018-12-11)


### Bug Fixes

* **core-lib:** fixed bug with type definition files in colors ([b07dadb](https://github.com/origami-cms/cms/commit/b07dadb))
* fixed local sourcing in docs ([8ecd751](https://github.com/origami-cms/cms/commit/8ecd751))


### Features

* added documentation json files ([9478f13](https://github.com/origami-cms/cms/commit/9478f13))
* **core-server:** changed server.static to use post-render position ([3a8153d](https://github.com/origami-cms/cms/commit/3a8153d))





## [0.0.3-alpha.5](https://github.com/origami-cms/cms/compare/v0.0.3-alpha.4...v0.0.3-alpha.5) (2018-12-05)


### Bug Fixes

* **cli:** fixed bug when running with no port configured or default port ([a672541](https://github.com/origami-cms/cms/commit/a672541))
* **core-server:** fixes for response format ([87c91fc](https://github.com/origami-cms/cms/commit/87c91fc))
* renamed res.local.responseCode to res.local.content.responseCode ([db7997e](https://github.com/origami-cms/cms/commit/db7997e))


### Features

* **core-server:** greatly improved formatting of response and casting ([50587d7](https://github.com/origami-cms/cms/commit/50587d7))
* **core-server:** status with unknown ln throws ErrorStatusLookup ([f3dc0e3](https://github.com/origami-cms/cms/commit/f3dc0e3))
* **origami:** added custom errors for no store type or unknown store ([89fe722](https://github.com/origami-cms/cms/commit/89fe722))
* **plugin-core-api:** added format option in query string ([aa2e6b9](https://github.com/origami-cms/cms/commit/aa2e6b9))
* **plugin-default-pages:** added unauthorized page and optimised styles ([87a88f7](https://github.com/origami-cms/cms/commit/87a88f7))





## [0.0.3-alpha.4](https://github.com/origami-cms/cms/compare/v0.0.3-alpha.3...v0.0.3-alpha.4) (2018-12-02)


### Bug Fixes

* **core-server:** improvements to response return type headers data etc ([e9f295a](https://github.com/origami-cms/cms/commit/e9f295a))


### Features

* **plugin-core-api:** allow for no store ([38c7ba8](https://github.com/origami-cms/cms/commit/38c7ba8))
* **plugin-default-pages:** added status codes to error pages ([d11c4b3](https://github.com/origami-cms/cms/commit/d11c4b3))
* **plugin-setup:** added plugin setup ([be746c7](https://github.com/origami-cms/cms/commit/be746c7))





## [0.0.3-alpha.3](https://github.com/origami-cms/cms/compare/v0.0.3-alpha.2...v0.0.3-alpha.3) (2018-11-28)


### Features

* **cli:** show origami version whenever a command is run ([a1bba8e](https://github.com/origami-cms/cms/commit/a1bba8e))





## [0.0.3-alpha.2](https://github.com/origami-cms/cms/compare/v0.0.3-alpha.1...v0.0.3-alpha.2) (2018-11-28)


### Bug Fixes

* **core-server:** apps were hosting static dirs with incorrect url ([b2e5632](https://github.com/origami-cms/cms/commit/b2e5632))
* **core-server:** fixed bug with pug rendering ([bed29cb](https://github.com/origami-cms/cms/commit/bed29cb))


### Features

* **plugin-default-pages:** added plugin default pages ([1fa947a](https://github.com/origami-cms/cms/commit/1fa947a))
* added default 500 error page ([e850779](https://github.com/origami-cms/cms/commit/e850779))
* added verbose debug logging in server route if needed ([6591bb1](https://github.com/origami-cms/cms/commit/6591bb1))





## [0.0.3-alpha.1](https://github.com/origami-cms/cms/compare/v0.0.3-alpha.0...v0.0.3-alpha.1) (2018-11-26)


### Bug Fixes

* **core-lib:** fixed issue with requireLib not awaiting ([2311f5f](https://github.com/origami-cms/cms/commit/2311f5f))
* **plugin-core-api:** fixed prefixes on main API endpoints ([ea452a2](https://github.com/origami-cms/cms/commit/ea452a2))


### Features

* added todo generator with leasot ([18ca419](https://github.com/origami-cms/cms/commit/18ca419))





## [0.0.3-alpha.0](https://github.com/origami-cms/cms/compare/v0.0.2...v0.0.3-alpha.0) (2018-11-24)


### Bug Fixes

* **cli:** adding files into publish ([aa556f6](https://github.com/origami-cms/cms/commit/aa556f6))





## 0.0.2 (2018-11-24)


### Bug Fixes

* **core-server:** fixing build for linux case sensitivity ([8d82903](https://github.com/origami-cms/cms/commit/8d82903))
* case sensitivity for linux ([80433f9](https://github.com/origami-cms/cms/commit/80433f9))
* case sensitivity for linux ([91ba0c2](https://github.com/origami-cms/cms/commit/91ba0c2))
* fix for travis private build ([1ba5bd6](https://github.com/origami-cms/cms/commit/1ba5bd6))
* fixing case senstive ([9d3bd3f](https://github.com/origami-cms/cms/commit/9d3bd3f))
* moved cli from origami-dev to origami ([0a19e98](https://github.com/origami-cms/cms/commit/0a19e98))
* removing case sensitive file ([5e378b8](https://github.com/origami-cms/cms/commit/5e378b8))
* removing case sensitive file ([ead3086](https://github.com/origami-cms/cms/commit/ead3086))
* upgraded media plugin to take any file name in form ([d422fb4](https://github.com/origami-cms/cms/commit/d422fb4))
* upgraded server with error bug fix ([398eca7](https://github.com/origami-cms/cms/commit/398eca7))


### Features

* added  --conventional-commits flags to publish ([f36cbae](https://github.com/origami-cms/cms/commit/f36cbae))
* added publish script ([24fd218](https://github.com/origami-cms/cms/commit/24fd218))
* added script to sync versions ([414ebbd](https://github.com/origami-cms/cms/commit/414ebbd))
* rewrite to monorepo 🎉 ([920a42e](https://github.com/origami-cms/cms/commit/920a42e))
* syncing versions script now adds in git ([4c24030](https://github.com/origami-cms/cms/commit/4c24030))
* updated to v2 of media plugin ([9b91eb7](https://github.com/origami-cms/cms/commit/9b91eb7))
* upgraded admin to include rich text editor ([98b24df](https://github.com/origami-cms/cms/commit/98b24df))
* upgraded default-pages plugin with extra logos ([2830aac](https://github.com/origami-cms/cms/commit/2830aac))
