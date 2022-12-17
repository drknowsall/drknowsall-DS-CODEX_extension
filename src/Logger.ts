import {Queue, current_time_str} from "./common";

export class Logger
{
  private readonly usage : Queue<string>
  private objects : [{}]

  constructor() {
    this.usage = new Queue<string>();
    this.objects = [{}]
    this.objects.pop();
  }

  set_usage_message(text:string, append_time=true, append_tab=false)
  {
    let usage_message = '';

    if (append_time)
    {
      const time = current_time_str();

      usage_message = time + ' ';
    }
    else if (append_tab)
    {
      usage_message = '\t';
    }

    usage_message += text.split('\n').join('\t\n');

    this.usage.enqueue(usage_message);
  }

  get_usage(header:string='Prediction Log:\n')
  {
    let usage = this.usage;
    let log = header;

    while (this.usage.size() > 0)
    {
      log += usage.dequeue() + '\n';
    }

    return log.slice(0, -1);
  }

  set_object_message(obj:any)
  {
    const time = current_time_str();
    this.objects.push({...obj, ...{'time':time}});
  }

  get_objects()
  {
    return 'Prediction Objects:\n\n\n' + JSON.stringify(this.objects,null, "\t").trim();
  }

  clear_all()
  {
    this.usage.clear();
    this.objects = [{}];
    this.objects.pop();
  }
}