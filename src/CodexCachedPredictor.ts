const { Configuration, OpenAIApi } = require('openai');
import {hashCode, replaceAll} from "./common";



export class CodexCachedPredictor {
    openai: any;
    params: any;
    cache_cmp: any;
    cache_exp: any;
    tokens_sent: number;
    tokens_received: number;

    constructor(
        codex_params = {
            model: 'code-davinci-002',
            temperature: 0,
            max_tokens: 256,
            frequency_penalty: 2,
            presence_penalty: 1,
            best_of: 1,
            stop: ['# In[']
        }) {
        this.tokens_sent = 0;
        this.tokens_received = 0;
        this.params = codex_params;
        this.cache_cmp = {};
        this.cache_exp = {};
    }

    set_params(params: any)
    {
        this.params = params;
    }

    set_key(openai_key: string)
    {
        const configuration = new Configuration({
            apiKey: openai_key
        });

        this.openai = new OpenAIApi(configuration);
    }

    async predict(text: string, explained=false) :  Promise<string | undefined>
    {
        text = text.trim();
        const h = hashCode(text);
        if (h in this.cache_cmp)
        {
            return this.cache_cmp[h];
        }

        let params;

        if (explained)
        {
            text += '\n# What the code does?';
            params = {
              model:  this.params['model'],
              prompt: text,
              temperature: 0,
              max_tokens: 50,
              frequency_penalty: 2,
              presence_penalty: 0,
              best_of: 3,
              stop: ['\n\n']
            };
        }
        else
        {
            params = {
              model: this.params['model'],
              prompt: text,
              temperature:  this.params['temperature'],
              max_tokens: this.params['max_tokens'],
              frequency_penalty: this.params['frequency_penalty'],
              presence_penalty: this.params['presence_penalty'],
              best_of: this.params['best_of'],
              stop: this.params['stop']
            };
        }

        try {
            const output = await this.openai.createCompletion(params);

            let result = output.data.choices[0].text;

            if (result.indexOf('In[') >= 0)
            {
              result = result.slice(0, text.indexOf('In['))
            }

            if (explained)
            {
                result = replaceAll(result, '//', '#')
                result = replaceAll(result, 'above', 'below')
                result = replaceAll(result, 'It', '').replace(/\s\s+/g, ' ').trim();

                let comment_lines = result.split('\n');
                let comment = '';
                for (let i = 0; i < comment_lines.length; i++)
                {
                    if (comment_lines[i][0] == '#' && comment_lines[i].length > 3)
                    {
                        comment += comment_lines[i] + '\n';
                    }
                }

                result = comment;
            }

            this.cache_cmp[h] = result;

            return result;
        }
        catch (e)
        {
            console.log('prediction API error: ' + e.message)
            return undefined;
        }
    }
}