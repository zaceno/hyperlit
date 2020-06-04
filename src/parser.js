import * as buildSteps from './build-steps.js'

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

export default (staticStep, dynamicStep, strs) => {
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
                    staticStep(buildSteps.addText, buffer.trimEnd())
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
                    staticStep(buildSteps.close)
                    mode = NEXT
                }
            } else if (mode == TAGNAME) {
                if (ws(ch)) {
                    staticStep(buildSteps.setTag, buffer)
                    mode = PROPS
                } else if (ch == '/') {
                    staticStep(buildSteps.setTag, buffer)
                    mode = SELFCLOSING
                } else if (ch == '>') {
                    staticStep(buildSteps.setTag, buffer)
                    staticStep(buildSteps.open)
                    mode = NEXT
                } else {
                    buffer += ch
                }
            } else if (mode == SELFCLOSING) {
                if (ch == '>') {
                    staticStep(buildSteps.selfClose)
                    mode = NEXT
                }
            } else if (mode == PROPS) {
                if (ch == '.') {
                } else if (ch == '/') {
                    mode = SELFCLOSING
                } else if (ch == '>') {
                    staticStep(buildSteps.open)
                    mode = NEXT
                } else if (!ws(ch)) {
                    buffer = ch
                    mode = PROPNAME
                }
            } else if (mode == PROPNAME) {
                if (ch == '=') {
                    staticStep(buildSteps.prop, buffer)
                    mode = PROPVAL
                } else if (ch == '>') {
                    staticStep(buildSteps.propDefault, buffer)
                    staticStep(buildSteps.open)
                    mode = NEXT
                } else if (ch == '/') {
                    staticStep(buildSteps.propDefault, buffer)
                    mode = SELFCLOSING
                } else if (ws(ch)) {
                    staticStep(buildSteps.propDefault, buffer)
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
                    staticStep(buildSteps.strval, buffer)
                    mode = PROPS
                } else {
                    buffer += ch
                }
            }
        }
        if (mode == TAG) {
            dynamicStep(buildSteps.setComponent)
            mode = PROPS
        } else if (mode == TEXT) {
            if (j == strs.length - 1) {
                buffer = buffer.trimEnd()
                staticStep(buildSteps.addText, buffer)
                buffer = ''
            } else {
                staticStep(buildSteps.addText, buffer)
                buffer = ''
                dynamicStep(buildSteps.addContent)
            }
        } else if (mode == PROPS) {
            dynamicStep(buildSteps.spreadProps)
        } else if (mode == PROPVAL) {
            dynamicStep(buildSteps.val)
            mode = PROPS
        } else if (mode == PROPVALSTR) {
            staticStep(buildSteps.strval, buffer)
            dynamicStep(buildSteps.strval)
            buffer = ''
        } else if (mode == CLOSINGTAG) {
            dynamicStep(buildSteps.noop)
        } else if (mode == NEXT && j < strs.length - 1) {
            dynamicStep(buildSteps.addContent)
        }
    }
}
