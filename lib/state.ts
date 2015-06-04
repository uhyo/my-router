import * as pathutil from './pathutil';
export default class State<T>{
    private table:{
        [seg:string]:State<T>
    };
    private value:T;
    constructor(){
        this.table={};
        this.value=void 0;
    }

    //find
    find(segs:Array<pathutil.PathSeg>,make?:boolean):State<T>{
        if(segs.length===0){
            return this;
        }
        var seg=segs[0];
        var res=this.table[seg];
        if(res==null){
            if(make===true){
                //init new state
                res=new State<T>();
                this.table[seg]=res;
                return res.find(segs.slice(1),make);
            }else{
                return null;
            }
        }
        return res.find(segs.slice(1),make);
    }
    //get value
    get():T{
        return this.value;
    }

    mount(value:T):void{
        this.value=value;
    }
}
