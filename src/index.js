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

const ws = c => c == ' ' || c == '\t' || c == '\n' || c == '\r'

const parse = (strs, vals, jstart, istart) => {
    let ch,
        buffer = '',
        tagname,
        propname,
        props,
        list = [],
        mode = NEXT,
        j,
        i

    const makenode = children => {
        list.push(tagname.call ? tagname(props, children) : h(tagname, props, children))
        mode = NEXT
    }

    const gotText = trim => {
        if (trim) buffer = buffer.trimEnd()
        if (!buffer) return
        list.push(buffer)
        buffer = ''
    }
    const recurse = () => {
        let r = parse(strs, vals, j, i + 1)
        makenode(r[0])
        j = r[1]
        i = r[2]
    }

    const gotTagName = (m=mode) => {
        tagname = buffer
        props = {}
        mode = m
    }

    const gotContent = () => {
        if(vals[j]) list = list.concat(vals[j])
    }

    const defaultProp = (m = mode) => {
        props[buffer] = true
        mode = m
    }

    const gotProp = v => {
        props[propname] = v
        mode = PROPS
    }

    for (j = jstart; j < strs.length; j++) {
        for (i = istart; i < strs[j].length; i++) {
            ch = strs[j][i]
            if (mode == NEXT) {
                if (ch == '<') {
                    mode = TAG
                } else if (!ws(ch)) {
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
                if (ch == '>') {
                    return [list, j, i]
                }
            } else if (mode == TAGNAME) {
                if (ws(ch)) {
                    gotTagName(PROPS)
                } else if (ch == '/') {
                    gotTagName(SELFCLOSING)
                } else if (ch == '>') {
                    gotTagName()
                    recurse()
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
                    recurse()
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
                    recurse()
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
        istart = 0
        if (mode == TAG) {
            tagname = vals[j]
            props = {}
            mode = PROPS
        } else if (mode == TEXT) {
            gotText(!vals[j])
            gotContent()
        } else if (mode == PROPS) {
            props = { ...props, ...vals[j] }
        } else if (mode == PROPVAL) {
            gotProp(vals[j])
        } else if (mode == PROPVALSTR) {
            buffer += vals[j]
        } else if (mode == NEXT) {
           gotContent()
        }
    }

    return [list.length == 1 ? list[0] : list, j, i]
}

export default (strs, ...vals) => parse(strs, vals, 0, 0)[0]
