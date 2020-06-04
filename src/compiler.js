import {init as initialContext}  from './build-steps'
import parse from './parser'
const identity = x => x

export default strs => {
    let builder = { prev: identity, handlers: []}
    let staticStep = (fn, arg) => {
        let oprev = builder.prev
        builder.prev = ctx => fn(oprev(ctx), arg)
    }
    let dynamicStep = fn => {
        let oprev = builder.prev
        builder.handlers.push((ctx, arg) => fn(oprev(ctx), arg))
        builder.prev = identity
    }
    parse(staticStep, dynamicStep, strs)
    return values => {
        let node = builder.prev(values.reduce(
            (context, value, index) => builder.handlers[index](context, value),
            initialContext()
        )).list
        return node.length>1 ? node : node[0]    
    }
}
