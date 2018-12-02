# Origami: Setup Plugin

This plugin generates a setup page for the initial user in Origami. The setup wizard is provided under `/setup`, and only allowed to be submitted once. Additionally, a `POST /api/v1/setup` route is exposed for the wizard to post to. Once there is more than one user in Origami, this `POST` will return `400`.

## Installation

This plugin is included by default in Origami. However if you wish to manually install, run:s

```bash
yarn add origami-plugin-setup
```

## Usage

In your `.origami` file, add it to the plugins:
`.origami`

```json
{
    ...
    "plugins": {
        "setup": true
    }
    ...
}
```

## Moving forward / TODO

- [ ] Add testing

## Issues

If you find a bug, please file an issue on the issue tracker on GitHub.

## Contributions

All pull requests and contributions are most welcome. Let's make the internet better!
