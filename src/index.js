import { h } from 'hyperapp'

let prev, handlers, list, tag, props, propname, parent

const noop = () => {}
const ws = c => c == ' ' || c == '\t' || c == '\n' || c == '\r'
const addNode = children => {
    list = [
        ...list,
        typeof tag === 'function'
            ? tag(props, children)
            : h(tag, props, children),
    ]
}
const staticStep = fn => (arg, oprev = prev) => (prev = () => fn(arg, oprev()))
const dynamicStep = fn => (oprev = prev) => {
    handlers.push(arg => {
        fn(arg, oprev())
    })
    prev = noop
}

const statAddText = staticStep(txt => txt && list.push(txt))
const statSetTag = staticStep(tag2 => {
    tag = tag2
    props = {}
})
const statPropDefault = staticStep(name => {
    props[name] = true
})
const statProp = staticStep(name => {
    propname = name
    props[name] = ''
})

const statStrVal = staticStep(val => {
    props[propname] += val
})

const statSelfClose = staticStep(() => addNode([]))

const statOpen = staticStep(() => {
    parent = [list, props, tag, parent]
    list = []
})

const statClose = staticStep(() => {
    let olist = list
    list = parent[0]
    props = parent[1]
    tag = parent[2]
    parent = parent[3]
    addNode(olist)
})

const dynStrVal = dynamicStep(val => {
    props[propname] += val
})
const dynAddContent = dynamicStep((content) => {
    list.push(typeof content == 'number' ? ('' + content) : content)
})
const dynSetComponent = dynamicStep(fn => {
    tag = fn
    props = {}
})
const dynSpreadProps = dynamicStep(props2 => {
    props = { ...props, ...props2 }
})
const dynVal = dynamicStep((val = true) => {
    props[propname] = val
})
const dynNoop = dynamicStep(noop)

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

const parse = strs => {
    let ch,
        buffer = '',
        mode = NEXT
    for (let j = 0; j < strs.length; j++) {
        for (let i = 0; i < strs[j].length; i++) {
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
                    statAddText(buffer.trimEnd())
                    buffer = ''
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
                    statClose()
                    mode = NEXT
                }
            } else if (mode == TAGNAME) {
                if (ws(ch)) {
                    statSetTag(buffer)
                    mode = PROPS
                } else if (ch == '/') {
                    statSetTag(buffer)
                    mode = SELFCLOSING
                } else if (ch == '>') {
                    statSetTag(buffer)
                    statOpen()
                    mode = NEXT
                } else {
                    buffer += ch
                }
            } else if (mode == SELFCLOSING) {
                if (ch == '>') {
                    statSelfClose()
                    mode = NEXT
                }
            } else if (mode == PROPS) {
                if (ch == '.') {
                } else if (ch == '/') {
                    mode = SELFCLOSING
                } else if (ch == '>') {
                    statOpen()
                    mode = NEXT
                } else if (!ws(ch)) {
                    buffer = ch
                    mode = PROPNAME
                }
            } else if (mode == PROPNAME) {
                if (ch == '=') {
                    statProp(buffer)
                    mode = PROPVAL
                } else if (ch == '>') {
                    statPropDefault(buffer)
                    statOpen()
                    mode = NEXT
                } else if (ch == '/') {
                    statPropDefault(buffer)
                    mode = SELFCLOSING
                } else if (ws(ch)) {
                    statPropDefault(buffer)
                    mode = PROPS
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
                    statStrVal(buffer)
                    mode = PROPS
                } else {
                    buffer += ch
                }
            }
        }
        if (mode == TAG) {
            dynSetComponent()
            mode = PROPS
        } else if (mode == TEXT) {
            if (j == strs.length - 1) {
                statAddText(buffer.trimEnd())
                buffer = ''
            } else {
                statAddText(buffer)
                buffer = ''
                dynAddContent()
            }
        } else if (mode == PROPS) {
            dynSpreadProps()
        } else if (mode == PROPVAL) {
            dynVal()
            mode = PROPS
        } else if (mode == PROPVALSTR) {
            statStrVal(buffer)
            dynStrVal()
            buffer = ''
        } else if (mode == CLOSINGTAG) {
            dynNoop()
        } else if (mode == NEXT && j < strs.length - 1) {
            dynAddContent()
        }
    }
}

const compile = strs => {
    prev = noop
    handlers = []
    parse(strs)
    let oprev = prev
    let ohandlers = handlers
    return values => {
        list = []
        for (let i = 0; i < values.length; i++) ohandlers[i](values[i])
        oprev()
        return list.length > 1 ? list : list[0]
    }
}

const memo = {}
const getFunc = (strs, key = strs.join('|'), f = memo[key]) =>
    f || (memo[key] = compile(strs))
export default (strs, ...vals) => getFunc(strs)(vals)
