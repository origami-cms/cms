delete
======



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/delete.svg)](https://npmjs.org/package/delete)
[![Downloads/week](https://img.shields.io/npm/dw/delete.svg)](https://npmjs.org/package/delete)
[![License](https://img.shields.io/npm/l/delete.svg)](https://github.com/tristanMatthias/delete/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @origami/cli
$ origami-dev COMMAND
running command...
$ origami-dev (-v|--version|version)
@origami/cli/0.0.1 darwin-x64 node-v10.9.0
$ origami-dev --help [COMMAND]
USAGE
  $ origami-dev COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`origami-dev help [COMMAND]`](#origami-dev-help-command)
* [`origami-dev run [ENTRY]`](#origami-dev-run-entry)

## `origami-dev help [COMMAND]`

display help for origami-dev

```
USAGE
  $ origami-dev help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_

## `origami-dev run [ENTRY]`

Run a origami instance

```
USAGE
  $ origami-dev run [ENTRY]

ARGUMENTS
  ENTRY  The .origami file, or directory with a .origami file to run

OPTIONS
  -o, --open  Open Origami in the web browser once it's running

EXAMPLES
  $ origami
  $ origami -o
  $ origami my-site/
  $ PORT=1234 origami my-site/
  $ ORIGAMI_STORE_SECRET=supersecret origami my-app/
```

_See code: [build/commands/run.ts](https://github.com/tristanMatthias/origami-dev/blob/v0.0.1/build/commands/run.ts)_
<!-- commandsstop -->
