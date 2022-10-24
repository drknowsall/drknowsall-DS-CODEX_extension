import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
    ContextConnector,
    ICompletionManager,
    KernelConnector,
} from '@jupyterlab/completer';


import {INotebookTracker, NotebookPanel} from '@jupyterlab/notebook';
import {CompletionConnector} from './connector';
import {CustomConnector} from './customconnector';

/**
 * Initialization data for the codexnb extension.
 */


namespace CommandIDs {
    export const codex = 'codex:invoke';
    export const invoke = 'completer:invoke';

    export const invokeNotebook = 'completer:invoke-notebook';

    export const select = 'completer:select';

    export const selectNotebook = 'completer:select-notebook';
}


const plugin: JupyterFrontEndPlugin<void> = {
    id: 'codexnb:plugin',
    autoStart: true,
    requires: [ICompletionManager, INotebookTracker],
    activate: async (app: JupyterFrontEnd, completionManager: ICompletionManager, notebooks: INotebookTracker) => {
        console.log('JupyterLab extension codexnb -_-');

        notebooks.widgetAdded.connect(
            (sender: INotebookTracker, panel: NotebookPanel) => {
                console.log('1')
                let editor = panel.content.activeCell?.editor ?? null;
                const session = panel.sessionContext.session;
                const options = {session, editor};

                const connector = new CompletionConnector([]);
                console.log('2')
                const handler = completionManager.register({
                    connector,
                    editor,
                    parent: panel,
                });
                console.log('3')
                console.log('editor: ' + editor + ' session ' + session)

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
        app.commands.addKeyBinding({
            command: CommandIDs.selectNotebook,
            keys: ['Enter'],
            selector: '.jp-Notebook .jp-mod-completer-active',
        });

        app.commands.addKeyBinding({
            command: CommandIDs.codex,
            args: {},
            keys: ['Accel 0'],
            selector: '.jp-Notebook'
        });

        let toggled = false;

        app.commands.addCommand(CommandIDs.codex, {
            label: 'My Cool Command',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggled,
            iconClass: 'some-css-icon-class',
            execute: () => {

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null fuck off!!');
                    return;
                }
                const cell = notebooks.currentWidget.content.model.contentFactory.createCell(
                    notebooks.currentWidget.content.notebookConfig.defaultCell, {});
                cell.value.text = "hellloooooo";
                notebooks.currentWidget.content.model.cells.push(cell);


                // this._notebookPanel.content.model.cells.insert(0, cell);
                console.log(`Executed ${CommandIDs.codex}`);
                toggled = !toggled;
                // }
                // })
            },
        });
    }
}

export default plugin;
