import State from './state';
import * as pathutil from './pathutil';

export interface RouterOptions{
    patternPrefix?:string,
    patterns?:{ [seg:string]:RegExp };
}

export interface RouteResult<T>{
    params:{
        [key:string]:string;
    };
    result:T;
}

export default class Router<T>{
    private root:State<T>;
    private patternPrefix:string;
    private patternid:number;
    private patterns:{
        [seg:string]:{
            pattern:RegExp;
            id:number;
        };
    };
    constructor(options?:RouterOptions){
        this.handleOptions(options);
        this.patterns={};
        this.patternid=1;
        this.root=new State<T>({
            patternPrefix:this.patternPrefix,
        });
        if(options!=null && options.patterns!=null){
            for(var key in options.patterns){
                this.addPattern(key,options.patterns[key]);
            }
        }
    }
    add(path:string,value:T):void{
        var segs=pathutil.split(path);
        var sts = this.root.go(segs,this.patterns);

        for(let i=0,l=sts.length;i<l;i++){
            if(!sts[i].has()){
                sts[i].mount(value);
            }
        }
    }
    route(path:string):RouteResult<T> | null{
        const segs = pathutil.split(path);
        const objs = this.root.match(segs);
        if(objs.length===0){
            return null;
        }
        for(let i=0,l=objs.length;i<l;i++){
            let o=objs[i];
            if(o.state.has()){
                return {
                    params:o.params,
                    result:o.state.get(),
                };
            }
        }
        return null;
    }
    addPattern(seg:string,regexp:RegExp):void{
        this.patterns[seg]={
            pattern:regexp,
            id:this.patternid++
        };
    }

    private handleOptions(options:RouterOptions | undefined):void{
        if(options==null){
            options={};
        }
        if("string"!==typeof options.patternPrefix){
            options.patternPrefix=":";
        }else if(options.patternPrefix.length!==1){
            console.warn("[my-router] WARN: patternPrefix must be one character");
        }

        this.patternPrefix=options.patternPrefix;
    }
}
