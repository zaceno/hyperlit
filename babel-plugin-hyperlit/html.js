import { h, text } from 'hyperapp'

export default function html(tag, props = {}, children = []) {
    if (Array.isArray(tag))
        return tag
            .flat(2)
            .filter((x) => x || x === 0)
            .map((ch) => (typeof ch == 'string' ? text(ch) : typeof ch == 'number' ? text('' + ch) : ch))
    if (typeof tag === 'function') return tag(props, html(children))
    return h(tag, props, html(children))
}
