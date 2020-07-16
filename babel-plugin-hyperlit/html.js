import {h, text} from 'hyperapp'

export default (tag, props={}, children=[]) => {
    children = children
        .flat()
        .filter(x => (x || x === 0))
        .map(ch =>
            typeof ch == 'string' ? text(ch)
            : typeof ch == 'number' ? text(''+ch)
            : ch
        )
    if (typeof tag === 'function') return tag(props, children)
    return h(tag, props, children)
}