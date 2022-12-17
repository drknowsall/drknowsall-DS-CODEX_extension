# DS-CODEX

## A Jupyter extention for auto-completetion and automatic code decorations, internally using OpenAI's codex - https://openai.com/blog/openai-codex/ with improved input selection that is specifically designed for notebooks usage and datascience pipeline. (API key is needed)

## Supporting the following operations:

1. Predict new code and/or markdown cells.
2. Predict a suffix for a cell (completes the cell's content).
3. Remove / Add comments to cells.

## The prediciton steps:

A. Input preproccessing:

1. Extract the *relevant* model input from the current and previus cells according to extraction_method, either extract_selective or window extraction
	* extract_selective:
		extract only the cells that are highly correleted with the active cell + the active cell (correlation is majored using a content similarity comparision)
	* extract_window:
		extract only the previus cells that are within the window (e.g. if window_size is 3 -> extract last 3 cells)
2. Add template cells if needed - add markdown cells above code cells that contains certain keywords in order to optimize future predictions aswell as completing the code structure and adding a proper documentation. (e.g. when reading an existing csv file a markdown cell is automaticlly being add on top of that cell, this markdown cell contains a metadata of the dataframe read from the csv file).

3. Adding notebook structure tokens for a more accurate future prediction. (e.g. cells ordinals, borders etc..)

B. Calling the API - calling codex API for the predicition

C. Post preoccessing:

1. Extract markdown and/or code cells found within the response.
2. Insert the content in the relevant location, inside a specific cell or as new cells (according to the type and the number of cells extracted from the output).


*The input extraction methods are optimized for data-science pipelines and notebook (cell based) predictions.
The methods has being tuned and trained on a dataset of high rated kaggle notebooks and showd an improved accuracy while comparing to the standalone model.

<img width="1321" alt="Screen Shot 2022-12-02 at 3 37 30" src="https://user-images.githubusercontent.com/99599998/206860404-17a1f780-d7a2-4f55-97eb-173648061903.png">

For further details please see: https://github.com/drknowsall/notebooks-autocompletion


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

The extension parameters:

	- "add_comments_before_prediction": false, # Whether to automaticlly add comments to your code before the prediction step (the comments will not be presented in the user cells.)
	
	- "add_markdowns_before_prediction": true, # Whether to automaticlly add markdown cells to your code (by keywords matching) before the prediction step (the markdown cells will not be presented in the user cells.)
	
	- "add_cell_structure": true, # Whether to represent the prediction input as a notebook.
	
	- "extract_selective": false, # Whether to extract cells using the selective method (if false then the default window based extraction is used).
	
	- "max_sim_ratio": 0.1, # max similarity ratio for selective extraction - the ratio between the similarity of the last cell before prediction and the closest cell w.r.t to the similarity method we use: (https://en.wikipedia.org/wiki/Jaccard_index),
	*All cells with similarities ratios higher then max_sim_ratio will be extracted and passed as input to the model.
	
	- "window_size": 3, # The window size to use if extract_selective is false.
	- "API_key": "", # OpenAI API Key. 
	- "add_codex_annotation": true, # Whether to add an indication that the cell has being predicted by Codex.

## Setting extension configurations: 

Press the right key on any cell in the notebook and then on "View Codex Configurations"
A new cell will be shown (the last cell) that contains the configurations.
Insert the api key and optionaly edit the configuration.
Press "Save Codex Configurations"

You are ready to go!

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
