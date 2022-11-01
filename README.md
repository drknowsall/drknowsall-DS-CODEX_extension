# CodexNB
## A Jupyter extention for auto-completetion using a wraper model for OpenAI's codex specificly designed for notebooks usage and datascience pipeline. (API key is needed)

## Spporting the following operationd:
## 1. Run codex - Run completion for the next cell - The completion metric is configurable please see "Setting extension configurations".
## 2. Run codex in cell - Run completion for the current cell.
## 3. Remove comments - remove all comments from the cells.

Installation:

## Requirements

- JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
pip install codex_nb_autocomplete
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall codex_nb_autocomplete
```

## Setting extension configurations: 

Press "set codex configurations"
Insert the api key at the buttom.
Press "read codex configurations"

You are ready to go!

The extension parameters:

{
	"add_comments": true, # Whether to automaticlly add comments to your code.
	"add_codex_annotation": false, # Adds a small cell indicating that the cell below is the output of codex.
	"extract_selective": false, # Whether to feed codex the cells in the default way - window or only pick the most relevant cells. 
	"append_markdown": true, # Whether to also return markdown cells.
	"append_notebook_cell_borders": true, # Improves the input structure for notebook usage.
	"append_dataset_meta": true, # Appends the name of the table, columns in every csv file that is being read by pandas.
	"window_size": 3, # The window size to use if extract_selective is false.
	"model_name": "codex",
	"model": {
		"model": "code-davinci-002", 
		"temperature": 0, # Increase this value for more "surprising results"
		"max_tokens": 256, # Max tokens to be sent to the API
	},
	"api_key": ""
}


## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the codex_nb_autocomplete directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall codex_nb_autocomplete
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `codex_nb_autocomplete` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro/) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
