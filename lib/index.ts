import State from './state';
import * as pathutil from './pathutil';

type Callback = (err:any,result:any)=>void;

interface RouterOptions{
    patternPrefix?:string,
    patterns?:{ [seg:string]:RegExp };
}

interface RouteResult<T>{
    params:{
        [key:string]:string;
    };
    result:T;
}

export default class Router<T>{
    private root:State<T>;
    private options:RouterOptions;
    constructor(options?:RouterOptions){
        this.handleOptions(options);
        this.root=new State<T>({
            patternPrefix:this.options.patternPrefix,
            patterns:this.options.patterns
        });
    }
    add(path:string,value:T):void{
        var segs=pathutil.split(path);
        var sts = this.root.go(segs);

        for(let i=0,l=sts.length;i<l;i++){
            if(!sts[i].has()){
                sts[i].mount(value);
            }
        }
    }
    route(path:string):RouteResult<T>{
        var segs=pathutil.split(path);
        var objs = this.root.match(segs);
        if(objs.length===0){
            return null;
        }
        for(let i=0,l=objs.length;i<l;i++){
            let o=objs[i];
            if(o.state.has()){
                return {
                    params:o.params,
                    result:o.state.get()
                };
            }
        }
        return null;
    }

    private handleOptions(options:RouterOptions):void{
        if(options==null){
            options={};
        }
        if("string"!==typeof options.patternPrefix){
            options.patternPrefix=":";
        }else if(options.patternPrefix.length!==1){
            console.warn("[my-router] WARN: patternPrefix must be one character");
        }
        if(options.patterns==null){
            options.patterns={};
        }

        this.options=options;
    }
}
