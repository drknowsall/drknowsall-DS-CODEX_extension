import {
    ILabStatus,
    JupyterFrontEnd,
    JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
    ContextConnector,
    ICompletionManager,
    KernelConnector,
} from '@jupyterlab/completer';

import {
    IDocumentManager,

} from '@jupyterlab/docmanager';

import {
    IStatusBar
} from '@jupyterlab/statusbar';

import { Widget} from '@lumino/widgets';

import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {INotebookTracker, NotebookPanel, INotebookModel} from '@jupyterlab/notebook';
import {CompletionConnector} from './connector';
import {CustomConnector} from './customconnector';
import { ToolbarButton } from '@jupyterlab/apputils';
import {codex_model} from './codex_nb';

/**
 * Initialization data for the codexnb extension.
 */


namespace CommandIDs {
    export const codex = 'codex:invoke';
    export const codex_rc = 'codex:read_conf';
    export const codex_sc = 'codex:set_conf';
    export const codex_ic = 'codex_ic:invoke';

    export const remove_comments = 'codex:remove_comments';
    export const select = 'completer:select';

    export const selectNotebook = 'completer:select-notebook';
}


export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  app: JupyterFrontEnd
  constructor(app: JupyterFrontEnd)
  {
      this.app = app
  }
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>,
  ): IDisposable {
    const codex_call = async () => {
      await this.app.commands.execute(CommandIDs.codex);
    };
    const button = new ToolbarButton({
      className: 'codexnb-button',
      label: 'run codex',
      onClick: codex_call,
      tooltip: 'run codex',
    });

    panel.toolbar.insertItem(10, 'codex call', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


export class ButtonExtension2
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  app: JupyterFrontEnd
  constructor(app: JupyterFrontEnd)
  {
      this.app = app
  }
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>,
  ): IDisposable {
    const codex_call = async () => {
      await this.app.commands.execute(CommandIDs.codex_ic);
    };
    const button = new ToolbarButton({
      className: 'codexnb_incell-button',
      label: 'run codex in cell',
      onClick: codex_call,
      tooltip: 'run codex in cell',
    });

    panel.toolbar.insertItem(11, 'codex in call', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


export class ButtonExtension3
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  app: JupyterFrontEnd
  constructor(app: JupyterFrontEnd)
  {
      this.app = app
  }
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>,
  ): IDisposable {
    const codex_call = async () => {
      await this.app.commands.execute(CommandIDs.remove_comments);
    };
    const button = new ToolbarButton({
      className: 'codexnb_incell-button',
      label: 'remove comments from cells',
      onClick: codex_call,
      tooltip: 'remove comments from cells',
    });

    panel.toolbar.insertItem(12, 'remove comments from cells', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


export class ButtonExtension4
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  app: JupyterFrontEnd
  constructor(app: JupyterFrontEnd)
  {
      this.app = app
  }
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>,
  ): IDisposable {
    const codex_call = async () => {
      await this.app.commands.execute(CommandIDs.codex_sc);
    };
    const button = new ToolbarButton({
      className: 'codexnb_set_conf',
      label: 'set codex configurations',
      onClick: codex_call,
      tooltip: 'set codex configurations',
    });

    panel.toolbar.insertItem(13, 'set codex configurations', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

export class ButtonExtension5
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  app: JupyterFrontEnd
  constructor(app: JupyterFrontEnd)
  {
      this.app = app
  }
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>,
  ): IDisposable {
    const codex_call = async () => {
      await this.app.commands.execute(CommandIDs.codex_rc);
    };
    const button = new ToolbarButton({
      className: 'codexnb_read_conf',
      label: 'read codex configurations',
      onClick: codex_call,
      tooltip: 'read codex configurations',
    });

    panel.toolbar.insertItem(14, 'read codex configurations', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

// const id = 'foo-extension:IFoo';
//
// interface IFoo {}Token
//
// class Foo implements IFoo {}
//
// const plugin: JupyterFrontEndPlugin<IFoo> = {
//   id,
//   autoStart: true,
//   requires: [IStateDB],
//   provides: IFoo,
//   activate: (app: JupyterFrontEnd, state: IStateDB): IFoo => {
//     const foo = new Foo();
//     const key = `${id}:some-attribute`;
//
//     // Load the saved plugin state and apply it once the app
//     // has finished restoring its former layout.
//     Promise.all([state.fetch(key), app.restored])
//       .then(([saved]) => { /* Update `foo` with `saved`. */ });
//
//     // Fulfill the plugin contract by returning an `IFoo`.
//     return foo;
//   }
// };

function cells_trim(notebooks: INotebookTracker)
{
    let cells = notebooks!.currentWidget!.content!.model!.cells;
    let i = cells.length - 1;

    while (cells.length > 0 && cells.get(i).value.text == '')
    {
        cells.remove(i);
        i --;
    }
}



const plugin: JupyterFrontEndPlugin<void> = {
    id: 'codexnb:plugin',
    autoStart: true,
    requires: [ICompletionManager, INotebookTracker, IDocumentManager, ILabStatus, IStatusBar],

    activate: async (app: JupyterFrontEnd, completionManager: ICompletionManager, notebooks: INotebookTracker, doc_manager: IDocumentManager, lab_status: ILabStatus, status_bar: IStatusBar) => {
        console.log('JupyterLab extension codexnb -_-');
         // let cache = Cache();
        // const key = `codexnb:plugin:some-attribute`;

    // Load the saved plugin state and apply it once the app
    // has finished restoring its former layout.
    // Promise.all([state_db.fetch(key), app.restored])
    //   .then(([saved]) => { /* Update `foo` with `saved`. */ });
        // doc_manager.createNew('cache');


        // doc_file.
        // doc_file!.node.textContent = '\0';
        //doc_manager.autosave = true;
        const statusWidget = new Widget();

        // lab_status.busySignal.connect(() => {
        //   statusWidget.node.textContent = lab_status.isBusy ? 'Busy' : 'Idle';
        // });

        status_bar.registerStatusItem('lab-status', {
          align: 'middle',
          item: statusWidget
        });

        notebooks.widgetAdded.connect(
            (sender: INotebookTracker, panel: NotebookPanel) => {

                let editor = panel.content.activeCell?.editor ?? null;
                const session = panel.sessionContext.session;
                const options = {session, editor};

                const connector = new CompletionConnector([]);

                const handler = completionManager.register({
                    connector,
                    editor,
                    parent: panel,
                });

                const updateConnector = () => {
                    editor = panel.content.activeCell?.editor ?? null;
                    options.session = panel.sessionContext.session;
                    options.editor = editor;
                    handler.editor = editor;
                    const kernel = new KernelConnector(options);
                    const context = new ContextConnector(options);
                    const custom = new CustomConnector(options);
                    handler.connector = new CompletionConnector([
                        kernel,
                        context,
                        custom
                    ]);
                };
                // Update the handler whenever the prompt or session changes
                panel.content.activeCellChanged.connect(updateConnector);
                panel.sessionContext.sessionChanged.connect(updateConnector);
            });
        // Add notebook completer select command.
        // app.commands.addCommand(CommandIDs.selectNotebook, {
        //   execute: () => {
        //     const id = notebooks.currentWidget && notebooks.currentWidget.id;
        //
        //     if (id) {
        //       return app.commands.execute(CommandIDs.select, { id });
        //     }
        //   },
        // });

        // Set enter key for notebook completer select command.
        // app.commands.addKeyBinding({
        //     command: CommandIDs.selectNotebook,
        //     keys: ['Enter'],
        //     selector: '.jp-Notebook .jp-mod-completer-active',
        // });

        app.commands.addKeyBinding({
            command: CommandIDs.codex,
            args: {},
            keys: ['Accel 0'],
            selector: '.jp-Notebook'
        });

        app.commands.addKeyBinding({
            command: CommandIDs.codex_ic,
            args: {},
            keys: ['Accel 1'],
            selector: '.jp-Notebook'
        });

           app.commands.addKeyBinding({
            command: CommandIDs.codex_rc,
            args: {},
            keys: ['Accel 9'],
            selector: '.jp-Notebook'
        });
           app.commands.addKeyBinding({
            command: CommandIDs.remove_comments,
            args: {},
            keys: ['Accel -'],
            selector: '.jp-Notebook'
        });


        app.commands.addKeyBinding({
            command: CommandIDs.codex_sc,
            args: {},
            keys: ['Accel 8'],
            selector: '.jp-Notebook'
        });

        //   var myPythonScriptPath = '/Users/guyhaimovitz/PycharmProjects/jupyter_extention_codex/notebooks-autocompletion';
        //
        // //  var PythonShell = require('python-shell').PythonShell;
        //
        //   var options = {
        //       mode: 'text',
        //       // pythonPath: 'path/to/python',
        //       pythonOptions: ['-u'],
        //       scriptPath: myPythonScriptPath,
        //       args: ['value1', 'value2', 'value3']
        //   };
        //   console.log("options:" + options + " powershell" + PythonShell)

        //
        // PythonShell.run('evaluate_autocomplete_model.py', options, function (err: any, results: any) {
        //     if (err) throw err;
        //     // results is an array consisting of messages collected during execution
        //     console.log('results: %j', results);
        // });
        //

        let toggled = false;
        let codex = new codex_model();
        app.commands.addCommand(CommandIDs.remove_comments, {
            label: 'Codex_remove_comments',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggled,
            iconClass: 'some-css-icon-class',
            execute: async () => {
                console.log(`toggeled ${toggled}`)
                if (toggled) {
                    console.log('running already');
                    return;
                } else {
                    toggled = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggled = false;
                    return;
                }
                let len = notebooks.currentWidget.content.model.cells.length;

                cells_trim(notebooks);
                if (len == 0 || notebooks.currentWidget.content.model.cells.get(len - 1).value.text == '') {
                    console.log('cells are empty!');
                    toggled = false;
                    return;
                }

                try {
                    await codex.remove_comments(notebooks, statusWidget)

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.remove_comments}`);
                toggled = false;

            }
        });

        app.commands.addCommand(CommandIDs.codex_rc, {
            label: 'Codex_readconf',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggled,
            iconClass: 'some-css-icon-class',
            execute: async () => {
                console.log(`toggeled ${toggled}`)
                if (toggled) {
                    console.log('running already');
                    return;
                } else {
                    toggled = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggled = false;
                    return;
                }
                let len = notebooks.currentWidget.content.model.cells.length;
                cells_trim(notebooks);
                if (len == 0 || notebooks.currentWidget.content.model.cells.get(len - 1).value.text == '') {
                    console.log('cells are empty!');
                    toggled = false;
                    return;
                }

                try {
                    await codex.read_conf(notebooks, statusWidget)

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.codex_rc}`);
                toggled = false;

            }
        });
          app.commands.addCommand(CommandIDs.codex_sc, {
            label: 'Codex_setconf',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggled,
            iconClass: 'some-css-icon-class',
            execute: async () => {
                console.log(`toggeled ${toggled}`)
                if (toggled) {
                    console.log('running already');
                    return;
                } else {
                    toggled = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggled = false;
                    return;
                }

                try {
                    await codex.set_conf(notebooks, statusWidget)

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.codex_sc}`);
                toggled = false;

            }
        });
        app.commands.addCommand(CommandIDs.codex, {
            label: 'Codex',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggled,
            iconClass: 'some-css-icon-class',
            execute: async () => {
                console.log(`toggeled ${toggled}`)
                if(toggled){
                    console.log('running already');
                    return;
                }else {
                    toggled = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggled = false;
                    return;
                }
                let len = notebooks.currentWidget.content.model.cells.length;
                cells_trim(notebooks);
                if (len == 0 || notebooks.currentWidget.content.model.cells.get(len - 1).value.text == '') {
                    console.log('cells are empty!');
                    toggled = false;
                    return;
                }

                //cell.value.text = "hellloooooo";
                //var nb_json = notebooks.currentWidget.content.model.toString();

                //var cells = notebooks.currentWidget.content.model.cells;
                try {
                    await codex.predict(notebooks, doc_manager, statusWidget, false);

                } catch (e) {
                    console.error(e.text);
                }

                // codex.predict(notebooks.currentWidget.content.model.cells, doc_manager).then(()=>
                // {
                //     if (!notebooks || !notebooks.currentWidget || ! notebooks.currentWidget.content.model) {return}
                //
                //     const cell = notebooks.currentWidget.content.model.contentFactory.createCodeCell({});
                //     cell.value.text = response;
                //     notebooks.currentWidget.content.model.cells.push(cell);
                // });
                //   // `.then()` is called after the request is complete
                //   // this is part of the Fetch API for handling JSON-encoded responses
                //     if (!notebooks || !notebooks.currentWidget || ! notebooks.currentWidget.content || !notebooks.currentWidget.model ) {return null}
                //
                //     notebooks.currentWidget.content.model.cells.push(cell);
                //   return cell.value.text = response;
                // });

                // cell.value.text = response;
                // notebooks.currentWidget.content.model.cells.push(cell);
                // this._notebookPanel.content.model.cells.insert(0, cell);
                console.log(`Executed ${CommandIDs.codex}`);
                toggled = false;
                // }
                // })
            },
        });

              app.commands.addCommand(CommandIDs.codex_ic, {
            label: 'Codex_in_cell',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggled,
            iconClass: 'some-css-icon-class',
            execute: async () => {
                console.log(`toggeled ${toggled}`)
                if(toggled){
                    console.log('running already');
                    return;
                }else {
                    toggled = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggled = false;
                    return;
                }
                let len = notebooks.currentWidget.content.model.cells.length;
                cells_trim(notebooks);
                if (len == 0 || notebooks.currentWidget.content.model.cells.get(len - 1).value.text == '') {
                    console.log('cells are empty!');
                    toggled = false;
                    return;
                }

                //cell.value.text = "hellloooooo";
                //var nb_json = notebooks.currentWidget.content.model.toString();

                //var cells = notebooks.currentWidget.content.model.cells;
                try {
                    await codex.predict(notebooks, doc_manager, statusWidget, true);

                } catch (e) {
                    console.error(e.text);
                }

                // codex.predict(notebooks.currentWidget.content.model.cells, doc_manager).then(()=>
                // {
                //     if (!notebooks || !notebooks.currentWidget || ! notebooks.currentWidget.content.model) {return}
                //
                //     const cell = notebooks.currentWidget.content.model.contentFactory.createCodeCell({});
                //     cell.value.text = response;
                //     notebooks.currentWidget.content.model.cells.push(cell);
                // });
                //   // `.then()` is called after the request is complete
                //   // this is part of the Fetch API for handling JSON-encoded responses
                //     if (!notebooks || !notebooks.currentWidget || ! notebooks.currentWidget.content || !notebooks.currentWidget.model ) {return null}
                //
                //     notebooks.currentWidget.content.model.cells.push(cell);
                //   return cell.value.text = response;
                // });

                // cell.value.text = response;
                // notebooks.currentWidget.content.model.cells.push(cell);
                // this._notebookPanel.content.model.cells.insert(0, cell);
                console.log(`Executed ${CommandIDs.codex_ic}`);
                toggled = false;
                // }
                // })
            },
        });

        app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension(app));
        app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension2(app));
        app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension3(app));
        app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension4(app));
        app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension5(app));
    }
}
export default plugin;
