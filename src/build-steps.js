import { h } from 'hyperapp'

export const init = () => ({list: []})

export function addText (ctx, txt) {
    if (txt) ctx.list.push(txt)
    return ctx
}
export function addContent (ctx, content=[]) {
   ctx.list = ctx.list.concat(content)
   return ctx
}
export function setComponent (ctx, fn) {
    ctx.tag = fn
    ctx.props = {}
    return ctx
}
export function setTag (ctx, tag) {
    ctx.tag = tag
    ctx.props = {}
    return ctx
}
export function spreadProps (ctx, props) {
    ctx.props = {...ctx.props, ...props}
    return ctx
}
export function propDefault (ctx, name) {
    ctx.props[name] = true
    return ctx
}

export function prop (ctx, name) {
    ctx.propname = name
    ctx.props[name] = ''
    return ctx
}
export function val (ctx, val=true) {
    ctx.props[ctx.propname] = val 
    return ctx
}
export function strval(ctx, val) {
    ctx.props[ctx.propname] += val
    return ctx
}

export function selfClose (ctx) {
    let node
    if (typeof ctx.tag === 'function' ) {
        node = ctx.tag(ctx.props, [])
    } else {
        node = h(ctx.tag, ctx.props, [])
    }
    ctx.list = ctx.list.concat(node)
    return ctx
}

export function open(ctx) {
    return {
        list: [],
        parent: ctx
    }
}

export function close (ctx) {
    let parent = ctx.parent
    let node
    if (typeof parent.tag === 'function' ) {
        node = parent.tag(parent.props, ctx.list)
    } else {
        node = h(parent.tag, parent.props, ctx.list)
    }
    parent.list = parent.list.concat(node)

    return parent
}

export function noop (ctx) {return ctx}