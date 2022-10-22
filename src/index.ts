import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the codex_nb_autocomplete extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'codex_nb_autocomplete:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension codex_nb_autocomplete is activated!');
  }
};

export default plugin;
