import {Queue, current_time_str} from "./common";

export class Logger
{
  private usage : Queue<string>
  private objects : Queue<{}>

  constructor() {
    this.usage = new Queue<string>();
    this.objects = new Queue<{}>();
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

  set_object_message(obj:{})
  {
    const time = current_time_str();

    this.objects.enqueue({obj, 'time':time});
  }

  get_objects(header:string='I/O Log:\n')
  {
    let objects = this.objects;
    let log = header;

    while (this.objects.size() > 0)
    {
      log += JSON.stringify(objects.dequeue(),null, "\t").trim() + ',\n';
    }

    return log.slice(0, -1);
  }

  clear_all()
  {
    this.usage.clear();
    this.objects.clear();
  }
}