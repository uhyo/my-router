import * as pathutil from './pathutil';

interface PathEntry<T>{
    seg:string;
    pattern?:RegExp;
    next:State<T>;
}

interface StateOptions{
    patternPrefix:string;
    patterns:{
        [seg:string]:RegExp;
    }
}
export default class State<T>{
    private table:Array<PathEntry<T>>;
    private value:T;
    private isset:boolean;
    constructor(private options:StateOptions){
        this.table=[];
        this.value=void 0;
        this.isset=false;
    }

    //go path
    go(segs:Array<string>):Array<State<T>>{
        if(segs.length===0){
            return [this];
        }
        var seg=segs[0];
        var result:Array<State<T>>=[];
        var fl=false;   // construction needed flag */
        for(let i=0,table=this.table,l=table.length;i<l;i++){
            let e=table[i];
            if(e.seg===seg){
                //match
                fl=true;
                result.push(...e.next.go(segs.slice(1)));
            }
            if(e.pattern!=null && seg[0]!==this.options.patternPrefix && e.pattern.test(seg)){
                //pattern match
                result.push(...e.next.go(segs.slice(1)));
            }
        }
        //no match
        if(fl===false){
            let res=new State<T>(this.cloneMyOptions());
            let p=seg[0]===this.options.patternPrefix ? this.options.patterns[seg] : null;
            if(p != null){
                // pattern is provided for this seg
                this.table.push({
                    seg:seg,
                    pattern:p,
                    next:res
                });
            }else{
                this.table.push({
                    seg:seg,
                    next:res
                });
            }
            result.push(...res.go(segs.slice(1)));
        }
        return result;
    }
    //match path
    match(segs:Array<string>):Array<State<T>>{
        if(segs.length===0){
            return [this];
        }
        var seg=segs[0];
        var result:Array<State<T>>=[];
        for(let i=0,table=this.table,l=table.length;i<l;i++){
            let e=table[i];
            if(e.pattern!=null){
                if(e.pattern.test(seg)){
                    result.push(...e.next.match(segs.slice(1)));
                }
            }else if(e.seg===seg){
                result.push(...e.next.match(segs.slice(1)));
            }
        }
        return result;
    }
    //get value
    get():T{
        return this.value;
    }
    //has value
    has():boolean{
        return this.isset;
    }

    mount(value:T):void{
        this.value=value;
        this.isset=true;
    }

    private cloneMyOptions():StateOptions{
        return {
            patternPrefix:this.options.patternPrefix,
            patterns:dict(this.options.patterns)
        };

        function dict<T>(obj:{[key:string]:T}):{[key:string]:T}{
            var result=<{[key:string]:T}>{};
            for(var key in obj){
                result[key]=obj[key];
            }
            return result;
        }
    }
}
