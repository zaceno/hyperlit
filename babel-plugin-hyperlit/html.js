import {h} from 'hyperapp'

export default (tag, props, children) => {
    children = children.flat(2)
    if (typeof tag === 'function') return tag(props, children)
    return h(tag, props, children)
}