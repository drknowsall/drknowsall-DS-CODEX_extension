import {INotebookModel} from '@jupyterlab/notebook';
import {ICellModel} from "@jupyterlab/cells";
import {IDocumentManager} from "@jupyterlab/docmanager";
import {CellTextConvertor} from "./CellTextConvertor";
import {CodexCachedPredictor} from "./CodexCachedPredictor";
import {markdown_keyword} from "./keyword_markdown";
/**
 * A custom connector for completion handlers.
 */

export class CellsDecorator {
  /**
   * Create a new custom connector for completion requests.
   *
   * @param options - The instatiation options for the custom connector.
   */


  markdown_keyword : Map<string, string[]>;
  codex_instructions : Map<string, string>;

  doc_manager : IDocumentManager;
  ctc: CellTextConvertor;
  ccp: CodexCachedPredictor;
  constructor(
    doc_manager: IDocumentManager, ccp: CodexCachedPredictor, ctc: CellTextConvertor) {

    this.doc_manager = doc_manager;
    this.markdown_keyword = markdown_keyword;
    this.codex_instructions = new Map<string, string>();
    this.ctc = ctc;
    this.ccp = ccp;
  }

  async extract_csv_meta(text: string) : Promise<string | undefined>
  {
        let fname_i1 = text.indexOf("read_csv('") + "read_csv('".length;
        let fname_i2 = text.indexOf("')");

        if (fname_i2 < 0)
        {
          fname_i2 = text.indexOf("\")");
        }

        let fname = text.substring(fname_i1, fname_i2);

        let file;
        try
        {
          file = await this.doc_manager.services.contents.get(fname);

          let table_name = fname.replace('.csv', '').split('/').pop();
          let columns = file.content
            .split('\n')[0]
            .split(',')
            .filter((value: string) => {
              return value != '';
            });

          return 'Table ' + table_name + ', columns = [' + columns.join(' ,') + ']';

        } catch (e)
        {
          return undefined
        }
  }

  async AddComments(cells : Array<ICellModel>) : Promise<{out_cells: Array<ICellModel>, meta: Array<{content:string, ord:number}>}>
  {
      let out_cells = Array<ICellModel>();
      let meta = Array<{content:string, ord:number}>();

      for (let l = 0; l < cells.length; l++) {
          let text = cells[l].value.text;
          if (text.trim()[0] != '#')
          {
              let comment = await this.ccp.predict(text, true);

              if (comment !== undefined)
              {
                cells[l].value.text = comment + '\n' + text.trim();
                meta.push({content:comment, ord:l})
              }
          }

          out_cells.push(cells[l]);
      }

      return {out_cells, meta};
  }

  async AddMarkdowns(model: INotebookModel, cells : Array<ICellModel>) : Promise<{out_cells: Array<ICellModel>, meta: Array<{content:string, ord:number, keyword:string}>}>
  {
        let out_cells = Array<ICellModel>();
        let meta = Array<{content:string, ord:number, keyword:string}>();

        for (let l = 0; l < cells.length; l++)
        {
            let text = cells[l].value.text;

            this.markdown_keyword.forEach((kw: string[], md: string) => {

                let keyword = '';

                for (let i = 0; i < kw.length; i++)
                {
                    if (text.indexOf(kw[i]) >= 0)
                    {
                        keyword = kw[i];
                        break;
                    }
                }

                let markdown_exist = false;

                for (let l0 = 0; l0 < l; l0++)
                {
                    if (cells[l0].value.text.indexOf(md) >= 0)
                    {
                        markdown_exist = true;
                    }
                }

                if (keyword != '' && !markdown_exist)
                {
                    out_cells.push(this.ctc.CreateMarkdownCell(model, md));
                    meta.push({content:md, ord:l, keyword:keyword})
                }
            });

            if (text.indexOf('read_csv') >= 0)
            {
               let meta_data = await this.extract_csv_meta(text);

                if (meta_data)
                {
                    let meta_data_exist = false;

                    for (let l0 = 0; l0 < l; l0++)
                    {
                        if (cells[l0].value.text.indexOf(meta_data) >= 0)
                        {
                            meta_data_exist = true;
                        }
                    }

                    if (!meta_data_exist)
                    {
                        out_cells.push(this.ctc.CreateMarkdownCell(model, meta_data));
                        meta.push({content:meta_data, ord:l, keyword:'read_csv'})
                    }
                }
            }

            out_cells.push(cells[l]);
        }

        return {out_cells, meta}
  }
}
