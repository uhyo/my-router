import * as pathutil from './pathutil';

interface SegDict{
    [key:string]:string;
}
interface PathEntry<T>{
    seg:string;
    pattern?:RegExp;
    params:SegDict;
    next:State<T>;
}

interface MatchResult<T>{
    params:SegDict;
    state:State<T>;
}

interface StateOptions{
    patternPrefix:string;
    patterns:{
        [seg:string]:RegExp;
    }
}
export default class State<T>{
    public table:Array<PathEntry<T>>;
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
        var fl=false;   //construction needed flag
        var result:Array<State<T>>=[];
        var targets:Array<PathEntry<T>>=[];
        for(let i=0,table=this.table,l=table.length;i<l;i++){
            let e=table[i];
            if(e.seg===seg){
                //match
                fl=true;
                result.push(...e.next.go(segs.slice(1)));
            }
            if(e.pattern!=null && seg[0]!==this.options.patternPrefix && e.pattern.test(seg)){
                //pattern match
                targets.push(e);
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
                    params:null,
                    next:res
                });
            }else{
                this.table.push({
                    seg:seg,
                    params:null,
                    next:res
                });
            }
            // modify res
            let t=res.table;
            for(let i=0,l=targets.length;i<l;i++){
                let tb=targets[i].next.table;
                for(let j=0,m=tb.length;j<m;j++){
                    let pe=tb[j];
                    let pa=pe.params ? clone(pe.params) : {};
                    if(p==null){
                        pa[pe.seg]=seg;
                    }
                    t.push({
                        seg:pe.seg,
                        pattern:pe.pattern,
                        params:pa,
                        next:pe.next
                    });
                }
            }
            result.push(...res.go(segs.slice(1)));
        }
        return result;
    }
    //match path
    match(segs:Array<string>):Array<MatchResult<T>>{
        if(segs.length===0){
            return [{
                params:{},
                state:this
            }];
        }
        var seg=segs[0];
        var result:Array<MatchResult<T>>=[];
        for(let i=0,table=this.table,l=table.length;i<l;i++){
            let e=table[i];
            if(e.pattern!=null){
                if(e.pattern.test(seg)){
                    let objs=e.next.match(segs.slice(1));
                    for(let j=0,m=objs.length;j<m;j++){
                        let o=objs[j];
                        let params=clone(o.params);
                        if(e.params != null){
                            for(let key in e.params){
                                params[key]=e.params[key];
                            }
                        }
                        if(!(e.seg in params)){
                            params[e.seg]=seg;
                        }

                        result.push({
                            params,
                            state:o.state
                        });
                    }
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

function clone(obj){
    if("object"!==typeof obj || obj instanceof RegExp || obj instanceof Date){
        return obj;
    }else if(Array.isArray(obj)){
        return obj.map((x)=>{return x});
    }
    var result:any={};
    var ks=Object.getOwnPropertyNames(obj);
    for(var i=0,l=ks.length;i<l;i++){
        let k=ks[i];
        result[k]=clone(obj[k]);
    }
    return result;
}
