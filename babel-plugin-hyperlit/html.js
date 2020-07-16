import {h, text} from 'hyperapp'

export default (tag, props={}, children=[]) => {
    children = children.flat().map(ch => ch===0 ? text('0') : typeof ch === 'string' ? text(ch) : ch).filter(x => x && x.type)
    if (typeof tag === 'function') return tag(props, children)
    return h(tag, props, children)
}