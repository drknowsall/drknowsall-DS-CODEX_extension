import { INotebookModel } from '@jupyterlab/notebook';
import { ICellModel } from '@jupyterlab/cells';
import {jaccard_similarity, replaceAll} from "./common";
export class CellTextConvertor {
    /**
     *
     *
     * @param
     */
    constructor() {

    }

    Cells2Text(cells :Array<ICellModel>, append_border=true, add_cell_structure=true, extract_selective=false, max_sim_ratio=0.1, set_header=true, md_header: string=' - Predicted With Codex -', cc_header: string='"""Predicted With Codex"""') {

        let ordinals = Array<number>();
        let max_sim = 0.;
        let min_sim = 1.;
        let c0 = cells[cells.length - 1].value.text.trim();

        if (set_header)
            if (cells[cells.length - 1].type =='markdown')
                c0 = c0.replace(md_header + '<br>', '');
            else
                c0 = c0.replace(cc_header + '\n', '');

        if (extract_selective) {

            for (let l = 0; l < cells.length - 1; l++) {
                let c1 = cells[l].value.text.trim();
                let s = jaccard_similarity(c0, c1)
                if (s < min_sim)
                    min_sim = s
                if (s > max_sim)
                    max_sim = s
            }
        }

        let cells_text = '';
        let i;
        for (i = 0; i < cells.length; i++)
        {
            let cell_text = cells[i].value.text.trim();

            if (cells[i].type =='markdown')
            {
                if (set_header)
                    cell_text = cell_text.replace(md_header + '<br>', '');

                if (cell_text.indexOf('<') >=0)
                  {
                    cell_text = '# ' + cell_text.substring(
                      cell_text.indexOf(">") + 1,
                      cell_text.lastIndexOf("<")
                      ).trim();
                  }
            }
            else
            {
                if (set_header)
                    cell_text = cell_text.replace(cc_header + '\n', '');
            }

            let sim = jaccard_similarity(c0, cell_text);

            if (extract_selective && (max_sim != min_sim && sim / max_sim < max_sim_ratio))
                continue

            ordinals.push(i);

            if (add_cell_structure)
                cell_text =  '# In[' + (i + 1) + ']:\n' + cell_text + '\n';

            cells_text += cell_text
        }

        if (add_cell_structure && append_border)
        {
             cells_text = cells_text + '# In[' + (i + 1) + ']:\n';
        }

        return {cells_text, ordinals}
    }

    static contains_markdown(text: string)
    {
        text = text.trim();
        return text.indexOf('#') == 0 && (text.charAt(2) == text.charAt(2).toUpperCase()) || (text.charAt(1) == text.charAt(1).toUpperCase());
    }

    public CreateMarkdownCell(model: INotebookModel, text:string, color:string='black', size= 5, append_header: string='')
      {
            let md_cell = model.contentFactory.createMarkdownCell({});

            text = replaceAll(text, '#', '');
            if (append_header != '')
            {
                text = append_header +'<br>' + text;
            }
            md_cell.value.text =
                "<font color=\'" + color  + "\'" + " size=\'" + size.toString()  + "px" +
                "\'" + ">" + replaceAll(text, '#', '') + '</font>';

            return md_cell;
      }

    public CreateCodeCell(model: INotebookModel,text:string, append_header: string='')
      {
        let code_cell = model.contentFactory.createCodeCell({});

        if (append_header != '')
        {
            text = append_header + '\n' + text;
        }

        code_cell.value.text = text;

        return code_cell;
      }

    Text2Cells(model: INotebookModel, text: string, set_header=true, markdown_color: string='black', markdown_text_size: number=5, append_md_header: string=' - Predicted With Codex -', append_cc_header: string='"""Predicted With Codex"""') : Array<ICellModel>{

        let cells = Array<ICellModel>();

        text = text.trim()
        if (!set_header)
        {
            append_md_header = '';
            append_cc_header = '';
        }
        if (CellTextConvertor.contains_markdown(text))
        {
          let lines = text.split('\n');

          cells.push(this.CreateMarkdownCell(model, lines.at(0)!, markdown_color, markdown_text_size, append_md_header));

          if (lines.length > 1) {
            text = lines.slice(1).join('\n').trim();

            cells.push(this.CreateCodeCell(model, text, append_cc_header));
          }
        }
        else
            cells.push(this.CreateCodeCell(model, text, append_cc_header));

        return cells;
    }
}