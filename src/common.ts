
export function replaceAll(str:string, find:string, replace:string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export function hashCode(str: string) {
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

export function current_time_str(): string
  {
    const d = new Date();
    return "["
        + d.getHours() + ":"
        + d.getMinutes() + ":"
        + d.getSeconds() + "]";
  }

interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}

export class Queue<T> implements IQueue<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  enqueue(item: T): void {
    if (this.size() === this.capacity) {
      throw Error("Queue has reached max capacity, you cannot add more items");
    }
    this.storage.push(item);
  }
  dequeue(): T | undefined {
    return this.storage.shift();
  }

  clear()
      {
        while (this.storage.length > 0 && this.storage.pop());
      }
  size(): number {
    return this.storage.length;
  }

  copy()
  {
    let out_q = new Queue<T>();
    let v;
    while ((v = this.dequeue()))
    {
      out_q.enqueue(v)
    }
    this.clear();
    for (let i = 0; i < this.storage.length ; i++)
    this.enqueue(out_q.storage[i]);

    return out_q;
  }
}


export function union(setA:Set<string>, setB:Set<string>) {
  const _union = new Set(setA);
  for (const elem of setB) {
    _union.add(elem);
  }
  return _union;
}

export function intersection(setA:Set<string>, setB:Set<string>) {
  const _intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}
function splitMulti(str:string, tokens:string[]){
  const tempChar = tokens[0]; // We can use the first token as a temporary join character
        for(let i = 1; i < tokens.length; i++){
            str = str.split(tokens[i]).join(tempChar);
        }
        return str.split(tempChar);
}

export function jaccard_similarity(text_a: string, text_b: string)
{

  let sentences_a = new Set<string>();

  for (const sent of text_a.split('\n'))
  {

     for (const word of splitMulti(sent, [' ', '.', '[', ']', '(', ')', '{', '}', '==', '=']))
      {
        sentences_a.add(word);
      }
  }
  sentences_a.delete('');
  let sentences_b = new Set<string>();

  for (const sent of text_b.split('\n'))
  {
     for (const word of splitMulti(sent, [' ', '.', '[', ']', '(', ')', '{', '}', '==', '=']))
      {
        sentences_b.add(word);
      }
  }
  sentences_b.delete('');
  const intersection_cardinality = intersection(sentences_a, sentences_b).size;

  const union_cardinality = union(sentences_a, sentences_b).size;

  return intersection_cardinality / union_cardinality;
}
