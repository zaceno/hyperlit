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

const ws = c => c == ' ' || c == '\t' || c == '\n'

const parse = (strs, vals, jstart, istart) => {
    let ch,
        buffer = '',
        tagname,
        propname,
        props,
        list = [],
        mode = NEXT,
        func,
        j,
        i

    const recurse = () => {
        let r = parse(strs, vals, j, i + 1)
        list.push(tagname ? h(tagname, props, r[0]) : func(props, r[0]))
        j = r[1]
        i = r[2]
        mode = NEXT
    }

    const gotTagName = () => {
        tagname = buffer
        props = {}
    }

    const gotText = () => {
        list.push(buffer.trim())
    }

    for (j = jstart; j < strs.length; j++) {
        if (mode == PROPVAL) {
            props[propname] = vals[j - 1]
            mode = PROPS
        }
        for (i = istart; i < strs[j].length; i++) {
            ch = strs[j][i]
            if (mode == NEXT) {
                if (ch == '<') {
                    mode = TAG
                    tagname = ''
                } else if (!ws(ch)) {
                    buffer = ch
                    mode = TEXT
                }
            } else if (mode == TEXT) {
                if (ch == '<') {
                    gotText()
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
                    gotTagName()
                    mode = PROPS
                } else if (ch == '/') {
                    gotTagName()
                    mode = SELFCLOSING
                } else if (ch == '>') {
                    gotTagName()
                    recurse()
                } else {
                    buffer += ch
                }
            } else if (mode == SELFCLOSING) {
                if (ch == '>') {
                    list.push(tagname ? h(tagname, props) : func(props, []))
                    mode = NEXT
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
                    props[propname] = buffer
                    mode = PROPS
                } else {
                    buffer += ch
                }
            }
        }
        istart = 0
        if (mode == TAG) {
            func = vals[j]
            props = {}
            mode = PROPS
        } else if (mode == TEXT) {
            gotText()
            mode = NEXT
        } else if (mode == PROPS) {
            props = { ...props, ...vals[j] }
        } else if (mode == PROPVALSTR) {
            props[propname] = vals[j]
            mode = PROPS
            istart = 1
        }
        if (j < strs.length - 1 && mode == NEXT) {
            list = [...list, ...(Array.isArray(vals[j]) ? vals[j] : [vals[j]])]
        }
    }
    if (mode == TEXT) {
        gotText()
    }

    list = list.length == 1 ? list[0] : list
    return [list, j, i]
}

export default (strs, ...vals) => parse(strs, vals, 0, 0)[0]
