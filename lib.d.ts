declare module "my-router"{
    export = Router;
    interface RouterOptions{
        patternPrefix?:string;
        patterns?:{
            [seg:string]:RegExp;
        }
    }
    interface RouteResult<T>{
        params:{
            [key:string]:string;
        };
        result:T;
    }
    class Router<T>{
        constructor(options?:RouterOptions);
        add(path:string,value:T):void;
        route(path:string):RouteResult<T>;
    }
}
