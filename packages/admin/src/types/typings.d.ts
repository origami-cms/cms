declare module 'redux-injector' {
    export function createInjectStore(reducers: object, middleware?: any);
    export function injectReducer(path: string, reducer: function);
}
