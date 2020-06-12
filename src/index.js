import { h } from 'hyperapp'

const NEXT = 0
const TEXT = 1
const TAG = 2
const CLOSINGTAG = 3
const TAGNAME = 4
const PROPS = 5
const SELFCLOSING = 6
const PROPNAME = 7
const PROPVAL = 8
const PROPVALSTR = 9

const ws = c => c == ' ' || c == '\t' || c == '\n' || c == '\r'

const parse = (strs, vals) => {
    let tagname, propname, props, parent, list = [], ch, buffer = '', mode = NEXT

    const makenode = children => {
        list.push(tagname.call ? tagname(props, children) : h(tagname, props, children))
        mode = NEXT
    }

    const gotText = trim => {
        if (trim) buffer = buffer.trimEnd()
        if (!buffer ) return
        list.push(buffer)
        buffer = ''
    }

    const open = () => {
        parent = [list, tagname, props, parent]
        list = []
        mode = NEXT
    }

    const gotTagName = (m=mode) => {
        tagname = buffer
        props = {}
        mode = m
    }

    const gotContent = (v) => {
        list.push(v === 0 ? '0' : v)
    }

    const defaultProp = (m = mode) => {
        props[buffer] = true
        mode = m
    }

    const gotProp = v => {
        props[propname] = v
        mode = PROPS
    }

    const close = () => {
        let children = list
        ;[list, tagname, props, parent] = parent
        makenode(children)
    }

    for (let j = 0; j < strs.length; j++) {
        for (let i = 0; i < strs[j].length; i++) {
            ch = strs[j][i]
            if (mode == NEXT) {
                if (ch == '<') {
                    mode = TAG
                } else if (ch == '\n') {
                    buffer = ch
                } else if (!ws(ch) || !ws(buffer)) {
                    mode = TEXT
                    buffer = ch
                }
            } else if (mode == TEXT) {
                if (ch == '<') {
                    gotText(true)
                    mode = TAG
                } else {
                    buffer += ch
                }
            } else if (mode == TAG) {
                if (ch == '/') {
                    mode = CLOSINGTAG
                } else {
                    mode = TAGNAME
                    buffer = ch
                }
            } else if (mode == CLOSINGTAG) {
                if (ch == '>') close()
            } else if (mode == TAGNAME) {
                if (ws(ch)) {
                    gotTagName(PROPS)
                } else if (ch == '/') {
                    gotTagName(SELFCLOSING)
                } else if (ch == '>') {
                    gotTagName()
                    open()
                } else {
                    buffer += ch
                }
            } else if (mode == SELFCLOSING) {
                if (ch == '>') {
                    makenode([])
                }
            } else if (mode == PROPS) {
                if (ch == '.') {
                } else if (ch == '/') {
                    mode = SELFCLOSING
                } else if (ch == '>') {
                    open()
                } else if (!ws(ch)) {
                    buffer = ch
                    mode = PROPNAME
                }
            } else if (mode == PROPNAME) {
                if (ch == '=') {
                    propname = buffer
                    mode = PROPVAL
                } else if (ch == '>') {
                    defaultProp()
                    open()
                } else if (ch == '/') {
                    defaultProp(SELFCLOSING)
                }else if (ws(ch)) {
                    defaultProp(PROPS)
                } else {
                    buffer += ch
                }
            } else if (mode == PROPVAL) {
                if (ch == '"') {
                    mode = PROPVALSTR
                    buffer = ''
                }
            } else if (mode == PROPVALSTR) {
                if (ch == '"') {
                    gotProp(buffer)
                } else {
                    buffer += ch
                }
            }
        }
        if (mode == TAG) {
            tagname = vals[j]
            props = {}
            mode = PROPS
        } else if (mode == TEXT) {
            gotText(!vals[j])
            gotContent(vals[j])
        } else if (mode == PROPS) {
            props = { ...props, ...vals[j] }
        } else if (mode == PROPVAL) {
            gotProp(vals[j])
        } else if (mode == PROPVALSTR) {
            buffer += vals[j]
        } else if (mode == NEXT && vals[j] != null) {
            gotContent(vals[j])
        }
    }

    return list.length == 1 ? list[0] : list
}

export default (strs, ...vals) => parse(strs, vals)
