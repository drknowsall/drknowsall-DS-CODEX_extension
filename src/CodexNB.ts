import {INotebookModel} from '@jupyterlab/notebook';
import { ICellModel } from '@jupyterlab/cells';
import {IDocumentManager} from "@jupyterlab/docmanager";
import {CellTextConvertor} from "./CellTextConvertor";
import {CodexCachedPredictor} from "./CodexCachedPredictor";
import {CellsDecorator} from "./CellsDecorator";
import {Logger} from "./Logger";

/**
 * CodexNB main request handler for the extension .
 */
export class CodexNB
{
  /**
   *
   *
   * @param
   */
  predictor: CodexCachedPredictor;
  cell_txt_cvt: CellTextConvertor;
  cell_dec: CellsDecorator;
  logger: Logger;

  def_params = {
    'add_comments_before_prediction':false,
    'add_markdowns_before_prediction':true,
    'add_cell_structure':true,
    'extract_selective':false,
    'max_sim_ratio': 0.1,
    'window_size':3,
    'API_key' : '',
    'add_codex_annotation': true,
  }
  params = this.def_params

  constructor(doc_manager: IDocumentManager) {
    this.predictor = new CodexCachedPredictor();
    this.cell_txt_cvt = new CellTextConvertor();
    this.cell_dec = new CellsDecorator(doc_manager, this.predictor, this.cell_txt_cvt);

    this.logger = new Logger();
  }

  copy_cells_to_model(model: INotebookModel, cells: Array<ICellModel>)
  {
        model.cells.clear();
        for (let i = 0; i < cells.length; i++)
        {
          model.cells.push(cells[i]);
        }
  }

  add_cells_to_model(model: INotebookModel, cells: Array<ICellModel>, active_cell_index:number)
  {
        for (let i = 0; i < cells.length; i++)
        {
          model.cells.insert(active_cell_index + i, cells[i]);
        }
  }

  copy_cells_from_model(model: INotebookModel, from:number=0, top: number=-1, skip_codex_annotation:boolean=true) : Array<ICellModel>
  {
    let cells = Array<ICellModel>();

    if (top < 0)
    {
      top = model.cells.length-1;
    }
    for (let i = from; i <= top; i++)
    {
      let model_cell = model.cells.get(i);
      if (model_cell.type == 'markdown')
      {
        if (skip_codex_annotation && model_cell.value.text.indexOf('DS-CODEX')>=0)
          continue

        cells.push(this.cell_txt_cvt.CreateMarkdownCell(model, model_cell.value.text))
      }
      else
      {
        cells.push(this.cell_txt_cvt.CreateCodeCell(model, model_cell.value.text))
      }
    }

    return cells;
  }

  replace_cells(model: INotebookModel, new_cells: Array<ICellModel>)
  {
    model.cells.clear();

    for (let i = 0; i < new_cells.length; i++)
    {
      model.cells.push(new_cells[i]);
    }
  }

  async predict(model: INotebookModel, active_cell_index:number, in_cell:boolean=false)
  {
    let top = active_cell_index;
    let cells;

    if (in_cell)
      this.logger.set_usage_message('DS-CODEX: Predicting In Cell: ' + top.toString());
    else
      this.logger.set_usage_message('DS-CODEX: Predicting Cell: ' + (top + 1).toString());

    if (this.params['extract_selective'])
    {
      cells = this.copy_cells_from_model(model, 0, top, this.params['add_codex_annotation']);
    }
    else
      cells = this.copy_cells_from_model(model, Math.max(top-this.params['window_size']+1, 0), top, this.params['add_codex_annotation']);

    let res_raw = this.cell_txt_cvt.Cells2Text(cells, !in_cell, false, this.params['extract_selective'], this.params['max_sim_ratio'], false).cells_text;

    model.cells.insert(top+1,this.cell_txt_cvt.CreateMarkdownCell(model, 'Please wait..', 'green'));

    let comments_meta = [{content:'', ord:1}];
    let markdowns_meta = [{content:'', ord:1, keyword:''}];
    markdowns_meta.pop();
    comments_meta.pop();

    if (this.params['add_comments_before_prediction'])
    {
      let res = await this.cell_dec.AddComments(cells);
      cells = res.out_cells;
      comments_meta = res.meta;
      this.logger.set_usage_message('DS-CODEX: Comments add',false, true);
    }

    if (this.params['add_markdowns_before_prediction'])
    {
      let res = await this.cell_dec.AddMarkdowns(model, cells);
      markdowns_meta = res.meta;
      cells = res.out_cells;
      this.logger.set_usage_message('DS-CODEX: Markdowns add',false, true);
    }
    let res = this.cell_txt_cvt.Cells2Text(cells,  !in_cell, this.params['add_cell_structure'], this.params['extract_selective'], this.params['max_sim_ratio']);
    let ord_input = res.ordinals;
    let codex_input = res.cells_text;
    this.logger.set_usage_message('DS-CODEX: Extracted Cells for Codex Input: ' + ord_input.toString(),false, true);
    this.logger.set_usage_message('DS-CODEX: #Input tokens: ' + codex_input.length.toString(),false, true);

    let codex_output = await this.predictor.predict(codex_input);

    model.cells.remove(top+1);

    if (codex_output !== undefined)
    {
      if (codex_output.trim() != '')
      {
        if (in_cell)
        {
              let cell_source = model.cells.get(top).value.text;

              while (cell_source.length > 0 && cell_source[cell_source.length-1] == '\n')
              {
                cell_source = cell_source.slice(0, cell_source.length-1);
              }

              while (codex_output.length > 0 && codex_output[codex_output.length-1] == '\n')
              {
                codex_output = codex_output.slice(0, codex_output.length-1);
              }
              let lc = model.cells.get(top)
              lc.value.text = cell_source + codex_output;
        }
        else
        {
          codex_output = codex_output.trim()
          let new_cells = this.cell_txt_cvt.Text2Cells(model, codex_output);
          this.logger.set_usage_message('DS-CODEX: #Output tokens: ' + codex_output.length.toString(),false, true);
          this.logger.set_usage_message(new_cells.length.toString() + ' Cells Extracted From Output',false, true);

          this.add_cells_to_model(model, new_cells, top+1);
          // if (this.params['add_codex_annotation'])
          //   model.cells.insert(top+1, this.cell_txt_cvt.CreateMarkdownCell(model, 'DS-CODEX', 'green', 3));

        }
      }
      else
      {
        this.logger.set_usage_message('DS-CODEX: Returned Empty Response',false, true);
        model.cells.insert(top+1, this.cell_txt_cvt.CreateMarkdownCell(model, 'DS-CODEX: empty response', 'orange', 3));
      }
    }
    else
    {
      this.logger.set_usage_message('DS-CODEX: Returned Error',false, true);
      model.cells.insert(top+1, this.cell_txt_cvt.CreateMarkdownCell(model, 'DS-CODEX Error: undefined response', 'red', 3));
    }

    let pred_info = {
      raw_input:res_raw,
      add_info: [{}],
      final_input: codex_input,
      DS_CODEX_output:codex_output
    }
    pred_info.add_info.pop();

    for (let i = 0; i < comments_meta.length; i++)
    {
      let ele_info = {
        content: comments_meta[i].content,
        type : 'comment',
        cell: comments_meta[i].ord,
      };
        pred_info.add_info.push(ele_info)
    }

    for (let i = 0; i < markdowns_meta.length; i++)
    {
      let ele_info = {
        content: markdowns_meta[i].content,
        type : 'markdown',
        cell: markdowns_meta[i].ord,
        keyword: markdowns_meta[i].keyword
      };

        pred_info.add_info.push(ele_info)
    }

    if (this.params['add_cell_structure'])
      pred_info.add_info.push({type : 'structure'})

    this.logger.set_object_message(pred_info);
  }

  async predict_new_cell(model: INotebookModel, active_cell_index:number)
  {
    return this.predict(model, active_cell_index, false);
  }
  async predict_in_cell(model: INotebookModel, active_cell_index:number)
  {
    return this.predict(model, active_cell_index, true);
  }

  async add_comment_to_active_cell(model: INotebookModel, active_cell_index:number)
  {
    let cells = Array<ICellModel>();
    cells.push(model.cells.get(active_cell_index));

    model.cells.insert(active_cell_index+1,this.cell_txt_cvt.CreateMarkdownCell(model, 'Please wait..', 'green'));

    let res = await this.cell_dec.AddComments(cells);

    model.cells.remove(active_cell_index+1);

    cells = res.out_cells;
    if (res.meta.length > 0)
    {
      model.cells.set(active_cell_index, cells[0]);
    }
    else
    {
        this.logger.set_usage_message('DS-CODEX: Could not find the right comment',false, true);
        model.cells.insert(active_cell_index+1, this.cell_txt_cvt.CreateMarkdownCell(model, 'DS-CODEX: Could not find the right comment', 'orange', 3));
    }
  }

  async add_comments_to_all_cells(model: INotebookModel)
  {
    let cells = this.copy_cells_from_model(model);

    model.cells.push(this.cell_txt_cvt.CreateMarkdownCell(model, 'Please wait..', 'green'));

    let res = await this.cell_dec.AddComments(cells);

    model.cells.remove(model.cells.length-1);

    this.replace_cells(model, res.out_cells);
  }

  async add_markdown_to_active_cell(model: INotebookModel, active_cell_index:number)
  {
    let cells = Array<ICellModel>();
    cells.push(model.cells.get(active_cell_index));

    model.cells.insert(active_cell_index+1,this.cell_txt_cvt.CreateMarkdownCell(model, 'Please wait..', 'green'));

    let res = await this.cell_dec.AddMarkdowns(model, cells);

    model.cells.remove(active_cell_index+1);

    if (res.out_cells.length > 1)
    {
      for (let i = 0; i < res.out_cells.length-1; i++)
      {
        model.cells.insert(active_cell_index - i, res.out_cells[i]);
      }
    }
    else
    {
        this.logger.set_usage_message('DS-CODEX: Could not find the right markdown',false, true);
        model.cells.insert(active_cell_index+1, this.cell_txt_cvt.CreateMarkdownCell(model, 'DS-CODEX: Could not find the right markdown', 'orange', 3));
    }
  }

  async add_markdowns_to_all_cells(model: INotebookModel)
  {
    let cells = this.copy_cells_from_model(model);
    model.cells.push(this.cell_txt_cvt.CreateMarkdownCell(model, 'Please wait..', 'green'));
    let res = await this.cell_dec.AddMarkdowns(model, cells);
    model.cells.remove(model.cells.length-1);
    this.replace_cells(model, res.out_cells);
  }

  show_prediction_log(model: INotebookModel)
  {
    let log = this.logger.get_usage();
    let rc = model.contentFactory.createRawCell({});
    rc.value.text = log;
    model.cells.push(rc);
  }

  show_obj_log(model: INotebookModel)
  {
    let log = this.logger.get_objects();
    let rc = model.contentFactory.createRawCell({});
    rc.value.text = log;
    model.cells.push(rc);
  }

  clear_logs()
  {
    this.logger.clear_all();
  }

  show_conf(model: INotebookModel)
  {
      let head_cell = this.cell_txt_cvt.CreateMarkdownCell(model, 'Model configurations (edit and save):', 'green', 3)

      let codexnb_params = this.params;
      let pred_params = this.predictor.params;

      let params = {...codexnb_params, ...pred_params};

      let params_cell = this.cell_txt_cvt.CreateCodeCell(model, JSON.stringify(params,null, "\t").trim());

      model.cells.push(head_cell);
      model.cells.push(params_cell);
  }

  save_conf(model: INotebookModel)
  {
        this.params = JSON.parse(model.cells.get(model.cells.length-1).value.text);
        this.predictor.set_key(this.params['API_key']);
        this.predictor.set_params(this.params);

        model.cells.remove(model.cells.length-1);
        model.cells.remove(model.cells.length-1);
  }

  reset_conf()
  {
      let key = this.params['API_key'];
      this.params = this.def_params;
      this.params['API_key'] = key;
  }
}