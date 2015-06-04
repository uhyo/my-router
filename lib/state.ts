import * as pathutil from './pathutil';
import PathSeg = pathutil.PathSeg;

interface PathEntry<T>{
    seg:PathSeg;
    next:State<T>;
}
export default class State<T>{
    private table:Array<PathEntry<T>>;
    private value:T;
    constructor(){
        this.table=[];
        this.value=void 0;
    }

    //find
    find(segs:Array<PathSeg>,make?:boolean):State<T>{
        if(segs.length===0){
            return this;
        }
        var seg=segs[0];
        for(let i=0,table=this.table,l=table.length;i<l;i++){
            let e=table[i];
            if(e.seg===seg){
                //match
                return e.next.find(segs.slice(1),make);
            }
        }
        //no match
        if(make===true){
            //init new state
            let res=new State<T>();
            this.table.push({
                seg:seg,
                next:res
            });
            return res.find(segs.slice(1),make);
        }else{
            return null;
        }
    }
    //get value
    get():T{
        return this.value;
    }

    mount(value:T):void{
        this.value=value;
    }
}
