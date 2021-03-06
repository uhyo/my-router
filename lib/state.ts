export interface SegDict{
    [key:string]:string;
}
export interface PathEntry<T>{
    seg:string;
    pattern?:RegExp;
    patternid?:number;
    params?:SegDict;
    next:State<T>;
}

export interface MatchResult<T>{
    params:SegDict;
    state:State<T>;
}

export interface StateOptions{
    patternPrefix:string;
}

//State with value & params
export default class State<T>{
    public staticTable:Array<PathEntry<T>>;
    public patternTable:Array<PathEntry<T>>;
    public params:SegDict;
    public requirements:{
        [seg:string]:boolean;
    }
    private value:T;
    private isset:boolean;
    constructor(private options:StateOptions){
        this.staticTable=[];
        this.patternTable=[];
        this.params={};
        this.requirements={};
        this.isset=false;
    }

    //go path
    go(segs:Array<string>,patterns: Record<string, {
        pattern:RegExp;
        id:number;
    }> = {},requirements: Record<string, boolean> = {}):Array<State<T>>{
        const ppx = this.options.patternPrefix;
        const newrequirements: Record<string, boolean> = clone(requirements);

        if(segs.length===0){
            return [this];
        }
        const isendpoint = segs.length===1;
        var seg=segs[0];
        var fl=false;   //construction needed flag
        var result:Array<State<T>>=[];
        if(seg[0] !== ppx){
            //static segment
            for(let i=0,table=this.staticTable,l=table.length;i<l;i++){
                let e=table[i];
                if(e.seg===seg){
                    //match
                    fl=true;
                    result.push(...e.next.go(segs.slice(1),patterns,newrequirements));
                    break;
                }
            }
        }else{
            //pattern segment
            let pent=patterns[seg];
            if(pent != null){
                for(let i=0,table=this.patternTable,l=table.length;i<l;i++){
                    let e=table[i];
                    if(e.patternid===pent.id){
                        //name matches
                        fl=true;
                        //update requirements
                        newrequirements[seg]=true;
                        result.push(...e.next.go(segs.slice(1),patterns,newrequirements));
                        break;
                    }
                }
            }
        }
        if(fl===false){
            let targets:Array<PathEntry<T>>=[];
            //find matching patterns if static
            if(seg[0]!==ppx){
                for(let i=0,table=this.patternTable,l=table.length;i<l;i++){
                    const e = table[i];
                    if(e.pattern && e.pattern.test(seg)){
                        //pattern match
                        targets.push(e);
                    }
                }
            }

            //new state for seg
            let res=new State<T>(this.cloneMyOptions());
            let p=seg[0]===ppx ? patterns[seg] : null;
            //make transition (this -> seg)
            if(p != null){
                // pattern is provided for this seg
                this.patternTable.push({
                    seg,
                    pattern: p.pattern,
                    patternid: p.id,
                    params: void 0,
                    next: res,
                });
            }else{
                this.staticTable.push({
                    seg,
                    params: void 0,
                    next: res,
                });
            }
            if(p != null){
                newrequirements[seg]=true;
            }
            // set requirements of res
            if(isendpoint){
                res.requirements=clone(newrequirements);
            }
            // modify res
            for(let i=0,l=targets.length;i<l;i++){
                let target=targets[i];
                let tan=target.next;
                // this -> (targets[i]) -> tan  and
                // this -> res

                //copy value to res
                if(!res.has() && tan.has()){
                    res.params= this.params ? clone(this.params) : {};
                    if(!(target.seg in res.params)){
                        res.params[target.seg]=seg;
                    }
                    const t = tan.get();
                    if (t){
                        res.mount(t);
                    }
                }
                //copy requirements to res
                if(i===0){
                    //only first match!
                    for(let key in tan.requirements){
                        res.requirements[key]=true;
                    }
                }
                //copy static transitions onto res
                let tb=tan.staticTable;
                for(let j=0,m=tb.length;j<m;j++){
                    let pe=tb[j];
                    //with additional matching info
                    let pa=pe.params ? clone(pe.params) : {};
                    if(p==null){
                        if(!(target.seg in pa)){
                            pa[target.seg]=seg;
                        }
                    }
                    res.staticTable.push({
                        seg:pe.seg,
                        params:pa,
                        next:pe.next
                    });
                }
                //copy pattern trasitions onto res
                tb=tan.patternTable;
                for(let j=0,m=tb.length;j<m;j++){
                    let pe=tb[j];
                    //with additional matching info
                    let pa=pe.params ? clone(pe.params) : {};
                    if(p==null){
                        if(!(target.seg in pa)){
                            pa[target.seg]=seg;
                        }
                    }
                    res.patternTable.push({
                        seg:pe.seg,
                        pattern:pe.pattern,
                        params:pa,
                        next:pe.next
                    });
                }
            }
            result.push(...res.go(segs.slice(1),patterns,newrequirements));
        }
        return result;
    }
    //match path
    match(segs:Array<string>):Array<MatchResult<T>>{
        if(segs.length===0){
            let params:SegDict={}, tp=this.params || {};
            //cut off unrequired params
            for(let key in this.requirements){
                params[key] = tp[key]; //undefined if none
            }
            return [{
                params,
                state:this
            }];
        }
        var seg=segs[0];
        var result:Array<MatchResult<T>>=[];
        // match with static transition
        for(let i=0,table=this.staticTable,l=table.length;i<l;i++){
            let e=table[i];
            if(e.seg===seg){
                let objs=e.next.match(segs.slice(1));
                for(let j=0,m=objs.length;j<m;j++){
                    let {params,state}=objs[j];
                    if(e.params != null){
                        for(let key in e.params){
                            if(key in params){
                                params[key]=e.params[key];
                            }
                        }
                    }
                    if(this.params != null){
                        for(let key in this.params){
                            if(key in params){
                                params[key]=this.params[key];
                            }
                        }
                    }
                    result.push({
                        params,
                        state
                    });
                }
            }
        }
        for(let i=0,table=this.patternTable,l=table.length;i<l;i++){
            let e=table[i];
            if(e.pattern && e.pattern.test(seg)){
                let objs=e.next.match(segs.slice(1));
                for(let j=0,m=objs.length;j<m;j++){
                    let o=objs[j];
                    let params=clone(o.params);
                    if(e.params != null){
                        for(let key in e.params){
                            if(key in params){
                                params[key]=e.params[key];
                            }
                        }
                    }
                    if(e.seg in params){
                        params[e.seg]=seg;
                    }
                    if(this.params != null){
                        for(let key in this.params){
                            if(key in params){
                                params[key]=this.params[key];
                            }
                        }
                    }

                    result.push({
                        params,
                        state:o.state
                    });
                }
            }
        }
        return result;
    }
    //get value
    get(): T{
        return this.value;
    }
    //has value
    has(): boolean{
        return this.isset;
    }

    mount(value:T):void{
        this.value=value;
        this.isset=true;
    }
    setParams(params:SegDict):void{
        this.params=clone(params);
    }

    private cloneMyOptions():StateOptions{
        return {
            patternPrefix:this.options.patternPrefix,
        };

        /*function dict<T>(obj:{[key:string]:T}):{[key:string]:T}{
            var result=<{[key:string]:T}>{};
            for(var key in obj){
                result[key]=obj[key];
            }
            return result;
        }*/
    }
}

function clone<T>(obj: T): T{
    if("object"!==typeof obj || obj==null || obj instanceof RegExp || obj instanceof Date){
        return obj as any;
    }else if(Array.isArray(obj)){
        return [...obj] as any;
    }
    const result:any = {};
    const ks = Object.getOwnPropertyNames(obj);
    for(let i=0, l=ks.length; i<l; i++){
        const k=ks[i];
        result[k] = clone((obj as any)[k]);
    }
    return result;
}
