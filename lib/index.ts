import State from './state';
import * as pathutil from './pathutil';

type Callback = (err:any,result:any)=>void;

interface RouterOptions{
    patternPrefix?:string,
    patterns?:{ [seg:string]:RegExp };
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
    route(path:string):T{
        var segs=pathutil.split(path);
        var sts = this.root.match(segs);
        if(sts.length===0){
            return void 0;
        }
        for(let i=0,l=sts.length;i<l;i++){
            if(sts[i].has()){
                return sts[i].get();
            }
        }
        return void 0;
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
