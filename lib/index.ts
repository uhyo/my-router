import State from './state';
import * as pathutil from './pathutil';

type Callback = (err:any,result:any)=>void;

export default class Router<T>{
    private root:State<T>;
    constructor(){
        this.root=new State<T>();
    }
    add(path:string,value:T):void{
        var segs=pathutil.split(path);
        var st = this.root.find(segs,true);
        st.mount(value);
    }
    route(path:string):T{
        var segs=pathutil.split(path);
        var st = this.root.find(segs);
        if(st==null){
            return void 0;
        }
        return st.get();
    }
}
