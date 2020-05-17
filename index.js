import { h } from 'hyperapp'
const FAILURE = 0
const INITIAL = 1
const TAG = 2
const TAGNAME = 3
const CLOSINGTAG = 4
const PROPS = 5
const CHILDREN = 6
const ENDTAG = 7
const NEXT = 8
const PROPNAME = 9
const PROPVAL = 10
const PROPVALSTR = 11
const PROPEND = 12
const CHILDSTR = 13
const Q = '"'
const S = '/'
const L = '<'
const G = '>'
const E = '='
const X = ' '
const N = ''
/*
const modenames = [
    'FAILURE',
    'INITIAL',
    'TAG',
    'TAGNAME',
    'CLOSINGTAG',
    'PROPS',
    'CHILDREN',
    'ENDTAG',
    'NEXT',
    'PROPNAME',
    'PROPVAL',
    'PROPVALSTR',
    'PROPEND',
    'CHILDSTR',
]
let logs = []
const log = (mode, ch, buffer, tagname, propname, props, children) => {
    logs.push({
        mode: modenames[mode],
        ch,
        buffer,
        tagname,
        propname,
        props: JSON.stringify(props),
        children: JSON.stringify(children),
    })
}*/

const parse = str => {
    let ch,
        buffer = '',
        tagname,
        propname,
        props = {},
        children = [],
        mode = INITIAL

    for (var i = 0; i < str.length; i++) {
        ch = str[i]
        //log(mode, ch, buffer, tagname, propname, props, children)
        if (mode == FAILURE) break
        if (mode == INITIAL) {
            if (ch == L) {
                mode = TAG
                buffer = N
            }
        } else if (mode == TAG) {
            if (ch == S) {
                mode = CLOSINGTAG
            } else {
                mode = TAGNAME
                buffer += ch
            }
        } else if (mode == TAGNAME) {
            if (ch == X) {
                mode = PROPS
                tagname = buffer
                buffer = N
            } else if (ch == G) {
                mode = CHILDREN
                tagname = buffer
                buffer = N
            } else if (ch == S) {
                mode = ENDTAG
                tagname = buffer
                buffer = N
            } else {
                buffer += ch
            }
        } else if (mode == PROPS) {
            if (ch == S) {
                mode = ENDTAG
            } else if (ch !== X) {
                mode = PROPNAME
                buffer = ch
            }
        } else if (mode == PROPNAME) {
            if (ch == E) {
                mode = PROPVAL
                propname = buffer
            } else {
                buffer += ch
            }
        } else if (mode == PROPVAL) {
            if (ch == Q) {
                mode = PROPVALSTR
                buffer = N
            } else {
                mode = FAILURE
            }
        } else if (mode == PROPVALSTR) {
            if (ch == Q) {
                props[propname] = buffer
                mode = PROPEND
            } else {
                buffer += ch
            }
        } else if (mode == PROPEND) {
            if (ch == X) {
                mode = PROPS
            } else if (ch == S) {
                mode = ENDTAG
            }
        } else if (mode == ENDTAG) {
            if (ch == G) {
                mode = NEXT
            }
        } else if (mode == CHILDREN) {
            if (ch !== L) {
                mode = CHILDSTR
                buffer = ch
            }
        } else if (mode == CHILDSTR) {
            if (ch == L) {
                children.push(buffer)
                mode = TAG
            } else {
                buffer += ch
            }
        } else if (mode == CLOSINGTAG) {
            if (ch == G) {
                mode = NEXT
            }
        }
    }

    //console.table(logs)
    if (mode !== FAILURE) return h(tagname, props, children)
}

export default (strings, values) => parse(strings[0])
