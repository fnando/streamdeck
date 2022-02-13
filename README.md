# @fnando/streamdeck

[![Tests](https://github.com/fnando/streamdeck/workflows/js-tests/badge.svg)](https://github.com/fnando/streamdeck)
[![NPM](https://img.shields.io/npm/v/@fnando/streamdeck.svg)](https://npmjs.org/package/@fnando/streamdeck)
[![NPM](https://img.shields.io/npm/dt/@fnando/streamdeck.svg)](https://npmjs.org/package/@fnando/streamdeck)
[![MIT License](https://img.shields.io/:License-MIT-blue.svg)](https://tldrlegal.com/license/mit-license)

A lean framework for developing Elgato Stream Deck plugins.

https://user-images.githubusercontent.com/3009/153739253-51973586-c278-4104-805c-ae61d534d33c.mp4

## Installation

To create a new plugin, use the following command:

```bash
npx @fnando/streamdeck create /path/to/your/plugin \
  --name 'Your Plugin Name' \
  --description 'Your plugin description' \
  --id 'com.sample.streamdeck-your-plugin' \
  --github your-github-user
```

If you prefer [Gitlab](https://gitlab.com), use `--gitlab` instead. There are
other options you may use, so if you want to check them out, the following
command instead:

```console
$ npx @fnando/streamdeck create --help
streamdeck create [path]

Create a new Stream Deck extension

Positionals:
  path  The extension path.                                    [string]

Options:
  --version      Show version number                          [boolean]
  --help         Show help                                    [boolean]
  --name         The human-readable name of the extension.
                                                    [string] [required]
  --id           A reversed-DNS format that identifies the extension.
                                                    [string] [required]
  --author       The author name.                         [default: ""]
  --email        The author email.                        [default: ""]
  --url          The extension url.                       [default: ""]
  --description  The extension description.
                               [default: "Your new Stream Deck plugin"]
  --github       Your Github user. When present, an origin pointing to
                 Github will be added.                    [default: ""]
  --gitlab       Your Gitlab user. When present, an origin pointing to
                 Gitlab will be added.                    [default: ""]
  --install      Install dependencies using npm.        [default: true]
```

## Usage

```console
$ streamdeck -h
Usage: streamdeck <command> [options]

Commands:
  streamdeck bundle          Build files under `build` directory. While
                             developing, use `--dev` to generate the
                             files that can be linked to Stream Deck's
                             plugins directory. It'll generate the
                             `.streamDeckPlugin` otherwise.
  streamdeck release         Release a new version of the plugin. This
                             command will export a new bundle, make a
                             new commit, tag it with the provided
                             version, alter CHANGELOG.md, and push to
                             your Git's repo origin source.
  streamdeck create [path]   Create a new Stream Deck extension
  streamdeck images          Create file with embedded images
  streamdeck link            Link the dist directory to Stream Deck's
                             plugin directory.
  streamdeck unlink          Remove the Stream Deck directory's link.
  streamdeck docs            Open Elgato's docs.
  streamdeck styleguide      Show Elgato's style guide
  streamdeck debug [action]  Manage debugging mode.

Options:
  --version  Show version number                              [boolean]
  --help     Show help                                        [boolean]
```

### Plugin structure

To be written.

### Workflow

#### Development

1. First, you need to enable the
   [debugging mode](https://developer.elgato.com/documentation/stream-deck/sdk/create-your-own-plugin/#debugging-your-javascript-plugin).
   This can be done by running `streamdeck debug enable`.
2. Symlink the plugin directory into Stream Deck's plugins directory by running
   `streamdeck link`.
3. To open the debugger page, you'll need a Chrome-based browser (Google Chrome,
   Brave, Microsoft Edge, Opera, etc). Use `streamdeck debug` to open
   `http://127.0.0.1:23654/` on your browser automatically.
4. It's recommended that you use [watchman](https://facebook.github.io/watchman)
   to automatically export files while developing your plugin. Make sure it's
   installed and then run
   `watchman-make -p 'src/**/*' '*.json' --run 'streamdeck bundle --dev'` to
   watch for changes and create the bundle automatically. Notice that some
   changes will also require that you restart the Stream Deck app.

#### Releasing a new version

Once your plugin is done, run `streamdeck release --version [version]`. This
command will update `CHANGELOG.md`, change `src/streamdeck.json`, generate the
`releases/*.streamDeckPlugin`, make a Git commit, tag this commit, and push to
your preferred Git hosting service (Github or Gitlab).

## Maintainer

- [Nando Vieira](https://github.com/fnando)

## Contributors

- https://github.com/fnando/streamdeck/contributors

## Contributing

For more details about how to contribute, please read
https://github.com/fnando/streamdeck/blob/main/CONTRIBUTING.md.

## License

The gem is available as open source under the terms of the
[MIT License](https://opensource.org/licenses/MIT). A copy of the license can be
found at https://github.com/fnando/streamdeck/blob/main/LICENSE.md.

## Code of Conduct

Everyone interacting in the @fnando/streamdeck project's codebases, issue
trackers, chat rooms and mailing lists is expected to follow the
[code of conduct](https://github.com/fnando/streamdeck/blob/main/CODE_OF_CONDUCT.md).
