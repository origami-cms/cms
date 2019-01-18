# Origami: Media Plugin
[![npm](https://img.shields.io/npm/v/origami-plugin-media.svg)](http://npmjs.com/package/origami-plugin-media)
[![Travis](https://img.shields.io/travis/origami-cms/plugin-media.svg)](https://travis-ci.org/origami-cms/plugin-media)
[![Codecov](https://img.shields.io/codecov/c/github/origami-cms/plugin-media.svg)](https://codecov.io/gh/origami-cms/plugin-media)

This plugin provides functionality to upload and serve media in Origami CMS. It's one of the core plugins bundled with Origami.

## Installation
```bash
yarn add @origami/plugin-media
```

## Usage
In your `.origami` file, add it to the plugins:
`.origami`
```json
{
    ...
    "plugins": {
        "media": {
            "location": "./media"
        }
    }
    ...
}
```

Once your app is running, it exposes the `/media` as a REST Resource
`GET /media`: List of media items
`POST /media`: Upload a file
`GET /media/:id` Download a file
`DELETE /media/:id` Delete a file

## Configuration
`location`: Directory location of where to store the files

## Moving forward / TODO
- [ ] Add other service providers for storing files (AWS, Dropbox, etc
- [ ] Add tests



## Issues
If you find a bug, please file an issue on the issue tracker on GitHub.


## Contributions
All pull requests and contributions are most welcome. Let's make the internet better!
