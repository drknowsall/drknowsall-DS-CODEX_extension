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

import {INotebookTracker, NotebookPanel} from '@jupyterlab/notebook';
import {CompletionConnector} from './connector';
import {CustomConnector} from './customconnector';
//import {codex_model} from './codex_nb';
import {CodexNB} from './CodexNB';

/**
 * Initialization data for the codexnb extension.
 */


namespace CommandIDs {
    export const predict_new = 'predict_new:invoke';
    export const predict_in = 'predict_in:invoke';
    export const add_comments = 'add_comments:invoke';
    export const add_comments_all = 'add_comments_all:invoke';
    export const add_markdowns = 'add_markdowns:invoke';
    export const add_markdowns_all = 'add_markdowns_all:invoke';
    export const pred_log = 'pred_log:invoke';
    export const obj_log = 'obj_log:invoke'
    export const clr_logs = 'clr_logs:invoke'
    export const show_conf = 'show_conf:invoke';
    export const save_conf = 'save_conf:invoke';
    export const reset_conf = 'reset_conf:invoke';
}

//
// function cells_trim(notebooks: INotebookTracker)
// {
//     let cells = notebooks!.currentWidget!.content!.model!.cells;
//     let i = cells.length - 1;
//
//     while (cells.length > 0 && cells.get(i).value.text == '')
//     {
//         cells.remove(i);
//         i --;
//     }
// }

const plugin: JupyterFrontEndPlugin<void> = {
    id: 'codexnb:plugin',
    autoStart: true,
    requires: [ICompletionManager, INotebookTracker, IDocumentManager, ILabStatus, IStatusBar],

    activate: async (app: JupyterFrontEnd, completionManager: ICompletionManager, notebooks: INotebookTracker, doc_manager: IDocumentManager, lab_status: ILabStatus, status_bar: IStatusBar) => {
        console.log('JupyterLab extension codexnb -_-');

        const statusWidget = new Widget();

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


        app.commands.addKeyBinding({
            command: CommandIDs.predict_new,
            args: {},
            keys: ['Accel 0'],
            selector: '.jp-Notebook'
        });

        app.commands.addKeyBinding({
            command: CommandIDs.predict_in,
            args: {},
            keys: ['Accel 1'],
            selector: '.jp-Notebook'
        });

        app.commands.addKeyBinding({
            command: CommandIDs.add_comments_all,
            args: {},
            keys: ['Accel 2'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.add_comments,
            args: {},
            keys: ['Accel 3'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.add_markdowns_all,
            args: {},
            keys: ['Accel 4'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.add_markdowns,
            args: {},
            keys: ['Accel 5'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.pred_log,
            args: {},
            keys: ['Accel 6'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.obj_log,
            args: {},
            keys: ['Accel 7'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.clr_logs,
            args: {},
            keys: ['Accel 8'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.show_conf,
            args: {},
            keys: ['Accel 9'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.save_conf,
            args: {},
            keys: ['Accel 9 s'],
            selector: '.jp-Notebook'
        });

         app.commands.addKeyBinding({
            command: CommandIDs.reset_conf,
            args: {},
            keys: ['Accel 9 r'],
            selector: '.jp-Notebook'
        });

        app.contextMenu.addItem({
          type: 'separator',
            selector: '.jp-Notebook'
        });
        app.contextMenu.addItem({
          command: CommandIDs.predict_new,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.predict_in,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.add_comments_all,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.add_comments,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.add_markdowns_all,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.add_markdowns,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.pred_log,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.obj_log,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.clr_logs,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.show_conf,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.save_conf,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        app.contextMenu.addItem({
          command: CommandIDs.reset_conf,
          selector: '.jp-Notebook', args: {
          "description": "Command arguments",
          "type": "object"
        }
        });

        let codex_nb = new CodexNB(doc_manager);

        let toggle = false;
        app.commands.addCommand(CommandIDs.predict_new, {
            label: 'Predict a New Cell\t\t[Cmd 0]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                if (notebooks.currentWidget.content.model.cells.length == 0) {
                    console.log('cells are empty!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.predict_new_cell(notebooks.currentWidget.content.model, notebooks.currentWidget.content.activeCellIndex);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.predict_new}`);
                toggle = false;
            }
        });

       app.commands.addCommand(CommandIDs.predict_in, {
            label: 'Predict In Cell\t\t[Cmd 1]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                if (notebooks.currentWidget.content.model.cells.length == 0) {
                    console.log('cells are empty!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.predict_in_cell(notebooks.currentWidget.content.model, notebooks.currentWidget.content.activeCellIndex);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.predict_in}`);
                toggle = false;
            }
        });

       app.commands.addCommand(CommandIDs.add_comments_all, {
            label: 'Add Comments to all Cells\t\t[Cmd 2]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                if (notebooks.currentWidget.content.model.cells.length == 0) {
                    console.log('cells are empty!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.add_comments_to_all_cells(notebooks.currentWidget.content.model);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.add_comments_all}`);
                toggle = false;
            }
        });

            app.commands.addCommand(CommandIDs.add_comments, {
            label: 'Add Comments to Active Cell\t\t[Cmd 3]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                if (notebooks.currentWidget.content.model.cells.length == 0) {
                    console.log('cells are empty!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.add_comment_to_active_cell(notebooks.currentWidget.content.model, notebooks.currentWidget.content.activeCellIndex);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.add_comments}`);
                toggle = false;
            }
        });

            app.commands.addCommand(CommandIDs.add_markdowns_all, {
            label: 'Add Markdowns to all Cells\t\t[Cmd 4]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                if (notebooks.currentWidget.content.model.cells.length == 0) {
                    console.log('cells are empty!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.add_markdowns_to_all_cells(notebooks.currentWidget.content.model);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.add_markdowns_all}`);
                toggle = false;
            }
        });

            app.commands.addCommand(CommandIDs.add_markdowns, {
            label: 'Add Markdowns to Active Cell\t\t[Cmd 5]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                if (notebooks.currentWidget.content.model.cells.length == 0) {
                    console.log('cells are empty!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.add_markdown_to_active_cell(notebooks.currentWidget.content.model, notebooks.currentWidget.content.activeCellIndex);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.add_markdowns}`);
                toggle = false;
            }
        });

            app.commands.addCommand(CommandIDs.pred_log, {
            label: 'View Prediction text Log\t\t[Cmd 6]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.show_prediction_log(notebooks.currentWidget.content.model);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.pred_log}`);
                toggle = false;
            }
        });

               app.commands.addCommand(CommandIDs.obj_log, {
            label: 'View Prediction JSON Log\t\t[Cmd 7]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.show_obj_log(notebooks.currentWidget.content.model);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.obj_log}`);
                toggle = false;
            }
        });
               app.commands.addCommand(CommandIDs.clr_logs, {
            label: 'Clear Logs\t\t[Cmd 8]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.clear_logs();

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.clr_logs}`);
                toggle = false;
            }
        });

    app.commands.addCommand(CommandIDs.show_conf, {
            label: 'View Configurations\t\t[Cmd 9]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.show_conf(notebooks.currentWidget.content.model);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.show_conf}`);
                toggle = false;
            }
        });

        app.commands.addCommand(CommandIDs.save_conf, {
            label: 'Save Configurations\t\t[Cmd 9 s]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.save_conf(notebooks.currentWidget.content.model);

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.save_conf}`);
                toggle = false;
            }
        });

            app.commands.addCommand(CommandIDs.reset_conf, {
            label: 'Reset Configurations\t\t[Cmd 9 r]',
            isEnabled: () => true,
            isVisible: () => true,
            isToggled: () => toggle,
            // iconClass: 'jp-MaterialIcon jp-LinkIcon',
            execute: async () => {
                console.log(`toggled ${toggle}`)
                if (toggle) {
                    console.log('running already');
                    return;
                } else {
                    toggle = true;
                }

                if (!notebooks.currentWidget || !notebooks.currentWidget.content.model) {
                    console.log('current widget is null!');
                    toggle = false;
                    return;
                }

                try {

                    await codex_nb.reset_conf();

                } catch (e) {
                    console.error(e.text);
                }

                console.log(`Executed ${CommandIDs.reset_conf}`);
                toggle = false;
            }
        });
    }
}
export default plugin;
