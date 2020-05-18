import { h } from 'hyperapp'

const DEBUG = false

const FAILURE = 0
const INITIAL = 1
const TAG = 2
const TAGNAME = 3
const CLOSINGTAG = 4
const PROPS = 5
const CHILDREN = 6
const ENDTAG = 7
const PROPNAME = 8
const PROPVAL = 9
const PROPVALSTR = 10
const PROPEND = 11
const CHILDSTR = 12
const MAYBECHILD = 13

const parse = (strs, vals, jstart, istart) => {
    let ch,
        buffer = '',
        tagname,
        propname,
        props = {},
        children = [],
        mode = INITIAL

    for (var j = jstart; j < strs.length; j++) {
        if (mode === PROPVAL) {
            props[propname] = vals[j - 1]
            mode = PROPEND
        }
        for (var i = istart; i < strs[j].length; i++) {
            ch = strs[j][i]
            if (mode == FAILURE) break
            if (mode == INITIAL) {
                if (ch == '<') {
                    mode = TAG
                    buffer = ''
                }
            } else if (mode == TAG) {
                if (ch == '/') {
                    mode = CLOSINGTAG
                } else {
                    mode = TAGNAME
                    buffer += ch
                }
            } else if (mode == TAGNAME) {
                if (ch == ' ') {
                    mode = PROPS
                    tagname = buffer
                    buffer = ''
                } else if (ch == '>') {
                    mode = CHILDREN
                    tagname = buffer
                    buffer = ''
                } else if (ch == '/') {
                    mode = ENDTAG
                    tagname = buffer
                    buffer = ''
                } else {
                    buffer += ch
                }
            } else if (mode == PROPS) {
                if (ch == '/') {
                    mode = ENDTAG
                } else if (ch == '>') {
                    mode = CHILDREN
                } else if (ch !== ' ') {
                    mode = PROPNAME
                    buffer = ch
                }
            } else if (mode == PROPNAME) {
                if (ch == '=') {
                    mode = PROPVAL
                    propname = buffer
                } else {
                    buffer += ch
                }
            } else if (mode == PROPVAL) {
                if (ch == '"') {
                    mode = PROPVALSTR
                    buffer = ''
                } else {
                    mode = FAILURE
                }
            } else if (mode == PROPVALSTR) {
                if (ch == '"') {
                    props[propname] = buffer
                    mode = PROPEND
                } else {
                    buffer += ch
                }
            } else if (mode == PROPEND) {
                if (ch == ' ') {
                    mode = PROPS
                } else if (ch == '/') {
                    mode = ENDTAG
                } else if (ch == '>') {
                    mode = CHILDREN
                }
            } else if (mode == ENDTAG) {
                if (ch == '>') {
                    return [h(tagname, props, children), j, i]
                }
            } else if (mode == CHILDREN) {
                if (ch == '<') {
                    mode = MAYBECHILD
                } else {
                    mode = CHILDSTR
                    buffer = ch
                }
            } else if (mode == CHILDSTR) {
                if (ch == '<') {
                    children.push(buffer)
                    mode = MAYBECHILD
                    buffer = ''
                } else {
                    buffer += ch
                }
            } else if (mode == MAYBECHILD) {
                if (ch == '/') {
                    mode = CLOSINGTAG
                } else {
                    let r = parse(strs, vals, j, i - 1)
                    children.push(r[0])
                    j = r[1]
                    i = r[2]
                    mode = CHILDREN
                }
            } else if (mode == CLOSINGTAG) {
                if (ch == '>') {
                    return [h(tagname, props, children), j, i]
                }
            }
        }
    }
}

export default (strs, ...vals) => parse(strs, vals, 0, 0)[0]
