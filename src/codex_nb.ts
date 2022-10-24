// import {
//   Cache,
// } from './Cache';

const { Configuration, OpenAIApi } = require('openai');
// const csv = require('csv-parser')
// const fs = require('fs')
// import {IConsoleTracker} from '@jupyterlab/console';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Widget} from '@lumino/widgets';
//

function union(setA:Set<string>, setB:Set<string>) {
  const _union = new Set(setA);
  for (const elem of setB) {
    _union.add(elem);
  }
  return _union;
}

function intersection(setA:Set<string>, setB:Set<string>) {
  const _intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

function jaccard_similarity(text_a: string, text_b: string)
{

  let sentences_a = new Set<string>();

  for (const sent of text_a.split('\n'))
  {

     for (const word of sent.split(' '))
      {
        sentences_a.add(word);
      }
  }

  let sentences_b = new Set<string>();

  for (const sent of text_b.split('\n'))
  {
     for (const word of sent.split(' '))
      {
        sentences_b.add(word);
      }
  }

  const intersection_cardinality = intersection(sentences_a, sentences_b).size;

  const union_cardinality = union(sentences_a, sentences_b).size;

  return intersection_cardinality / union_cardinality;

}



function hashCode(str: string) {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export class codex_model {
  openai: any;
  params: any;
  api_key: any;
  cache_cmp: any;
  cache_exp: any;
  constructor(
    codex_params = {
      model: 'code-davinci-002',
      temperature: 0,
      max_tokens: 256,
      frequency_penalty: 2,
      presence_penalty: 1,
      best_of: 1,
      stop: ['# In[']
    },
    api_key = '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' //Remove before push!
  ) {

    this.params = {
      add_comments:true,
      add_codex_annotation:true,
      extract_selective:true,
      append_markdown: false,
      append_notebook_cell_borders: true,
      append_dataset_meta: true,
      append_output: false,
      window_size: 3,
      model_name: 'codex',
      model: codex_params
    };
    this.cache_cmp = {};
    this.cache_exp = {};

    //Remove before push!
    this.api_key = api_key;

    const configuration = new Configuration({
      apiKey: this.api_key
    });
    this.openai = new OpenAIApi(configuration);
    //
  }

  async add_comments(
    notebooks: INotebookTracker,
    doc_manager: IDocumentManager,
    explained = true,
  ) {
    let append_meta = this.params['append_dataset_meta'];
    let append_import = true;
    let append_train = true;
    let append_test = true;

    let cells = notebooks.currentWidget!.content.model!.cells;

    if (explained) {
      for (let l = 0; l < cells.length; l++) {
        if (cells.get(l).type == 'markdown') continue;

        let cell_source = cells.get(l).value.text.trim() + '\n';
        if (
          cell_source.length <= 20 ||
          cell_source.trim().substring(0, 10).indexOf('#') >= 0
        ) {
          continue;
        }

        let exp = await this.codex_explain_call(cell_source);
        exp = exp
          .replace('//', '#')
          .replace('It', '')
          .replace(/\s\s+/g, ' ')
          .trim();
        // exp = exp.charAt(0).toUpperCase() + exp.slice(1);
        if (exp.length > 2) {
          cells.get(l).value.text = exp + '\n' + cells.get(l).value.text;
        }

        // let cell = notebooks.currentWidget.content.model.contentFactory.createMarkdownCell({});
        // cell.value.text = exp.trim();
        // cells.insert(l, cell);
        // l += 1;
      }
    }
    for (let l = 0; l < cells.length; l++) {
      let cell_source = cells.get(l).value.text.trim() + '\n';
      if (
        cell_source.indexOf('Table ') >= 0 &&
        cell_source.indexOf(', columns = [') >= 0
      ) {
        append_meta = false;
      }
      if (cell_source.indexOf('Importing relevant libraries') >= 0) {
        append_import = false;
      }
      if (cell_source.indexOf('Training the model') >= 0) {
        append_train = false;
      }
      if (cell_source.indexOf('Testing the model') >= 0) {
        append_test = false;
      }
      if (cell_source.indexOf('[Created by codex]') >= 0) {
        continue;
      }
      if (append_meta && cell_source.indexOf('read_csv') >= 0) {

        let fname_i1 = cell_source.indexOf("read_csv('") + "read_csv('".length;
        let fname_i2 = cell_source.indexOf("')");
        if (fname_i2 < 0)
        {
          fname_i2 = cell_source.indexOf("\")");
        }

        let fname = cell_source.substring(fname_i1, fname_i2);
        let file = await doc_manager.services.contents.get(fname);
        let table_name = fname.replace('.csv', '').split('/').pop();
        let columns = file.content
          .split('\n')[0]
          .split(',')
          .filter((value: string) => {
            return value != '';
          });
        let dataset_meta =
          'Table ' + table_name + ', columns = [' + columns.join(' ,') + ']';

        let cell = this.get_markdown(notebooks, dataset_meta, 'black');

        cells.insert(l, cell);

        cell = this.get_markdown(notebooks, 'Data Exploration', 'black');

        cells.insert(l + 2, cell);
        l += 2;
      } else if (
        append_import &&
        (cell_source.match(/import/g) || []).length >= 2
      ) {
        const cell = this.get_markdown(notebooks, 'Importing relevant libraries', 'black');
        cells.insert(l, cell);
        l += 1;
      } else if (append_train && cell_source.indexOf('train') >= 0) {
        const cell = this.get_markdown(notebooks, 'Training the model', 'black');
        cells.insert(l, cell);
        l += 1;
      } else if (
        (append_test && cell_source.indexOf('test') >= 0) ||
        cell_source.indexOf('eval') >= 0 ||
        cell_source.indexOf('score') >= 0
      ) {
        const cell = this.get_markdown(notebooks, 'Testing the model', 'black');

        cells.insert(l, cell);
        l += 1;
      }
    }
  }

  extract_input_selective(notebooks: any, in_cell: boolean): string {
    let cells = notebooks.currentWidget.content.model.cells;

     if (cells.length == 1)
        return this.extract_input(notebooks, in_cell);

    let cells_content: string[] = [];

    let append_borders = this.params['append_notebook_cell_borders'];

    let max_sim = 0.;
    let min_sim = 1.;
    //let sum_sim = 0.;

    let c0 = cells.get(cells.length-1).value.text.trim();

    for (let l = 0 ; l < cells.length-1; l++) {
      let c1 = cells.get(l).value.text.trim();
      let s = jaccard_similarity(c0, c1)
      if (s < min_sim)
        min_sim = s
      if (s > max_sim)
        max_sim = s
      //sum_sim += s
    }
    //let avg_sim = sum_sim / cells.length

    let k = 0 ;
    for (let l = 0 ; l < cells.length; l++) {
      let cell_source = cells.get(l).value.text.trim();


      if (max_sim != min_sim && jaccard_similarity(c0, cell_source) / max_sim < 0.1)
            continue

      cell_source = cell_source + '\n';

      if (cells.get(l).type =='markdown' && cell_source.indexOf('<') >=0)
      {
        cell_source = '# ' + cell_source.substring(
          cell_source.indexOf(">") + 1,
          cell_source.lastIndexOf("<")
          ).trim() + '\n';

      }

      if (cell_source.indexOf('[Created by codex]') >= 0) {
        continue;
      }


      if (append_borders) {
        cell_source = '# In[' + k + ']:\n' + cell_source;
      }

      cells_content.push(cell_source);
      k += 1;
    }

    let model_input = cells_content.join('').trim();

    if (!in_cell && append_borders) {
      model_input = model_input + '\n' + '# In[' + k + ']:\n';
    }

    return model_input;
  }

  remove_comments(notebooks: any, statusWidget: Widget)
  {
    statusWidget.node.textContent = 'removing comments..';
    let cells = notebooks.currentWidget.content.model.cells;
    for (let l = 0; l < cells.length; l++) {
      let cell_source = cells.get(l).value.text.trim();
      cell_source = cell_source.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'').trim();

      cell_source = cell_source.replace(/#.*/g,'').trim();
      cells.get(l).value.text = cell_source;
    }
    statusWidget.node.textContent = 'done!';
  }

  extract_input(notebooks: any, in_cell: boolean): string {
    let cells = notebooks.currentWidget.content.model.cells;
    let cells_content: string[] = [];

    let append_borders = this.params['append_notebook_cell_borders'];
    let l = Math.max(0, cells.length - this.params['window_size']);

    for (; l < cells.length; l++) {

      let cell_source = cells.get(l).value.text.trim() + '\n';

      if (cells.get(l).type =='markdown' && cell_source.indexOf('<') >=0)
      {
        cell_source =  '# ' + cell_source.substring(
          cell_source.indexOf(">") + 1,
          cell_source.lastIndexOf("<")
          ).trim() + '\n';
      }

      if (cell_source.indexOf('[Created by codex]') >= 0) {
        continue;
      }

      if (append_borders) {
        cell_source = '# In[' + l + ']:\n' + cell_source;
      }

      cells_content.push(cell_source);
    }

    let model_input = cells_content.join('').trim();

    if (!in_cell && append_borders) {
      model_input = model_input + '\n' + '# In[' + l + ']:\n';
    }

    return model_input;
  }
  //
  // add_to_file_log(doc_manager:IDocumentManager, content:string, fname='codexnb')
  // {
  //    let doc_file = doc_manager.openOrReveal('codexnb');
  //    doc_file!.node.textContent += 'heeeeelllllooooo';
  //    doc_manager.openOrReveal('Untitled.ipynb');
  // }

         async read_conf(notebooks: INotebookTracker, statusWidget: Widget)
  {

        console.log('Codex: reading conf..');
        statusWidget.node.textContent = 'Codex: reading conf..';
        const model = notebooks.currentWidget!.content.model!;
        if (model.cells.length ==0)
        {
          return;
        }
        let str_params = model.cells.get(model.cells.length-1).value.text;

        let params = JSON.parse(str_params);

        this.params =  params;
        // this.params = params;

        const configuration = new Configuration({
        apiKey: this.params['api_key']
        });

        this.openai = new OpenAIApi(configuration);
        model.cells.remove(model.cells.length-1);
        model.cells.remove(model.cells.length-1);
        console.log('Codex: conf read successfully!');
        statusWidget.node.textContent = 'Codex: conf read successfully!';
        return
  }

  get_markdown(notebooks: INotebookTracker, text:string, color:string, size= 5)
  {
        const model = notebooks.currentWidget!.content.model!;
        let md_cell = model.contentFactory.createMarkdownCell({});

        md_cell.value.text = "<font color=\'" + color  + "\'" + " size=\'" + size.toString()  + "px" + "\'" + ">" + text.replace('#', '') + '</font>';
        return md_cell;
  }

  async set_conf(notebooks: INotebookTracker, statusWidget: Widget)
  {
        console.log('Codex: set conf..');
        statusWidget.node.textContent = 'Codex: set conf..';
        const model = notebooks.currentWidget!.content.model!;

        let md_cell = this.get_markdown(notebooks, 'Add Codexnb configurations:', 'black');

        model.cells.push(md_cell);

        let cell = model.contentFactory.createCodeCell({});

        let params = this.params;
        params['api_key'] = '';
        cell.value.text = JSON.stringify(params,null, "\t");

        model.cells.push(cell);
        statusWidget.node.textContent = 'Codex: set conf successfully!';
  }

  async predict(
    notebooks: INotebookTracker,
    doc_manager: IDocumentManager,
    statusWidget: Widget,
    in_cell: boolean
  ) {
    console.log('Codex: extracting input..');
    statusWidget.node.textContent = 'Codex: add comments..';
    if (this.params['add_comments'])
      await this.add_comments(notebooks, doc_manager);
    let codex_input;
    statusWidget.node.textContent = 'Codex: extracting input..';
    if (this.params['extract_selective'])
      codex_input = this.extract_input_selective(notebooks, in_cell);
    else
      codex_input = this.extract_input(notebooks, in_cell);

    let cell;
    statusWidget.node.textContent = 'Codex: predicted, #input tokens= ' + codex_input.length;
    let codex_output = await this.codex_completion_call(codex_input);
    const model = notebooks.currentWidget!.content.model!;

    // let doc_file = doc_manager.openOrReveal('codexnb');
    // doc_file!.node.textContent += 'heeeeelllllooooo';
    // doc_file = doc_manager.openOrReveal('Untitled.ipynb');
    // let out = console_tracker.currentWidget?.contentFactory.createOutputPrompt();

    if (model.cells.get(model.cells.length - 1).value.text == codex_output)
     {
       statusWidget.node.textContent = 'Codex: duplicate prediction - ignore';
       return;
    }

    if (in_cell)
    {

      model.cells.get(model.cells.length - 1).value.text += codex_output;
    }
    else
    {
        if (this.params['add_codex_annotation']) {
          cell = this.get_markdown(notebooks, '[Created by codex]', 'grey', 1);

          model.cells.push(cell);
        }

        if (this.params['add_comments'] &&
          codex_output.indexOf('#') == 0 &&
          codex_output.charAt(2) == codex_output.charAt(2).toUpperCase()
        ) {
          let lines = codex_output.split('\n');

          cell = this.get_markdown(notebooks, lines[0], 'black');

          model.cells.push(cell);

          if (lines.length > 1) {
            codex_output = lines.slice(1).join('\n').trim();

            cell = model.contentFactory.createCodeCell({});

            cell.value.text = codex_output;

            model.cells.push(cell);
          }
        } else {
          cell = model.contentFactory.createCodeCell({});
          cell.value.text = codex_output;

          model.cells.push(cell);
        }
    }
    console.log(
      'Codex: predict, #tokens= ' + codex_input.length + ' input =\n' +
        codex_input +
        '\n' +
        'output =\n' +
        codex_output
    );

    statusWidget.node.textContent = 'Codex: predicted successfully, #output tokens= ' + codex_output.length;
  }

  async codex_completion_call(text: string): Promise<string> {
    const h = hashCode(text);
    //let cached = await this.cache.match(text);

    // if (cached)
    // {
    //   return cached.text();
    // }

    if (h in this.cache_cmp) {
      return this.cache_cmp[h];
    }

    let params = this.params['model'];
    params['prompt'] = text;

    const output = await this.openai.createCompletion(params);


    var result = output.data.choices[0].text.trim();

    this.cache_cmp[h] = result;
    //await this.cache.put(text, result);

    return result;
  }

  async codex_explain_call(text: string): Promise<string> {

    const h = hashCode(text);
    if (h in this.cache_exp) {
      return this.cache_exp[h];
    }

    text += '\n// What the code does?';
    let params = {
      model: 'code-davinci-002',
      prompt: text,
      temperature: 0,
      max_tokens: 128,
      frequency_penalty: 0,
      presence_penalty: 0,
      best_of: 1,
      stop: ['\n\n']
    };

    const output = await this.openai.createCompletion(params);
    var result = output.data.choices[0].text.trim();
    //const output = await this.openai.createCompletion(this.params['model']);
    this.cache_exp[h] = result;
    return result;
  }
}