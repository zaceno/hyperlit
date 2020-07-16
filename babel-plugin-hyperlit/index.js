
class StringCombiner {
    constructor () {
        this.current = ''
        this.chunks = []
    }
    addChar (ch) {
        this.current += ch
    }
    addNode (n) {
        if (this.current.length) this.chunks.push(this.current)
        this.chunks.push(n)
        this.current = ''
    }
    getChunks () {
        return this.chunks.concat(this.current.length ? this.current : [])
    }
}

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

const parser = h => {
    const parse = (strs, vals) => {
        let tagname,
            propname,
            props,
            parent,
            list = [],
            ch,
            buffer = '',
            mode = NEXT

        const listpush = (x) => list.push(x)

        const pushnode = (children) => {
            listpush(h(tagname, props, children))
            mode = NEXT
        }

        const gotText = (trim) => {
            if (trim) buffer = buffer.trimEnd()
            listpush(buffer)
            buffer = ''
        }

        const open = () => {
            parent = [list, tagname, props, parent]
            list = []
            mode = NEXT
        }

        const gotTagName = (m = mode) => {
            tagname = buffer
            props = [{}]
            mode = m
        }

        const defaultProp = (m = mode) => {
            props[0][buffer] = true
            mode = m
        }

        const gotProp = (v) => {
            props[0][propname] = v
            mode = PROPS
        }

        const close = () => {
            let children = list
            ;[list, tagname, props, parent] = parent
            pushnode(children)
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
                        pushnode([])
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
                    } else if (ws(ch)) {
                        defaultProp(PROPS)
                    } else {
                        buffer += ch
                    }
                } else if (mode == PROPVAL) {
                    if (ch == '"') {
                        mode = PROPVALSTR
                        buffer = new StringCombiner()
                    }
                } else if (mode == PROPVALSTR) {
                    if (ch == '"') {
                        gotProp(buffer)
                    } else {
                        buffer.addChar(ch)
                    }
                }
            }
            if (mode == TAG) {
                tagname = vals[j]
                props = [{}]
                mode = PROPS
            } else if (mode == TEXT) {
                gotText(!vals[j])
                listpush(vals[j])
            } else if (mode == PROPS) {
                props = [...props, vals[j]]
            } else if (mode == PROPVAL) {
                gotProp(vals[j])
            } else if (mode == PROPVALSTR) {
                buffer.addNode(vals[j])
            } else if (mode == NEXT && vals[j] != null) {
                listpush(vals[j])
            }
        }

        return list.length > 1 ? list : list[0]
    }

    return (strs, ...vals) => parse(strs, vals)
}

module.exports = ({types: t}) => {

	function propertyName(key) {
		if (t.isValidIdentifier(key)) {
			return t.identifier(key);
		}
		return t.stringLiteral(key);
	}

	function objectExpression(obj) {
        if (t.isNode(obj)) return obj

		let properties = Object.keys(obj).map(key => {
            let value = obj[key]
            if (value instanceof StringCombiner) {
                let parts = value.getChunks()
                value = t.stringLiteral('')
                parts.forEach(part => {
                    value = t.binaryExpression('+', value, t.isNode(part) ? part : t.valueToNode(part))
                })
            }
            else if(!t.isNode(value)) {
                value = t.valueToNode(value)
            }

/*            let values = obj[key].map ? obj[key] : [obj[key]]
            values = values.map(valueOrNode =>  t.isNode(valueOrNode) ? valueOrNode : t.valueToNode(valueOrNode))

			let node = values[0];
			if (values.length > 1 && !t.isStringLiteral(node) && !t.isStringLiteral(values[1])) {
				node = t.binaryExpression('+', t.stringLiteral(''), node);
			}
			values.slice(1).forEach(value => {
				node = t.binaryExpression('+', node, value);
            });
        */
            
			return t.objectProperty(propertyName(key), value);
        });
        return t.objectExpression(properties)
    }

    function mergedObjects  (objs) {
        objs = [...objs.slice(1), objs[0]]
        if (objs.length === 1) return objectExpression(objs[0])
        return t.objectExpression(objs.map(obj => t.spreadElement(objectExpression(obj))))
    }
    
    const myParse = fname => parser((tag, props, children) => {
        let stag = t.isNode(tag)  ? tag : t.stringLiteral(tag)
        let sprops = mergedObjects(props)
        let schildren = arrayToNode(children || [])
        return t.callExpression(t.identifier(fname), [stag, sprops, schildren])
    })

    const arrayToNode = arr =>  t.arrayExpression(arr.map(val => t.isNode(val) ? val : t.valueToNode(val)))

    return {
        name: 'hyperlit',
        visitor: {
            ImportDeclaration (path, state) {
                if (path.node.source.value === 'hyperlit') {
                    let fname = path.node.specifiers[0].local.name
                    state.set('hyperlitName', fname)
                    path.replaceWith(
                        t.importDeclaration(
                            [
                                t.importDefaultSpecifier(t.identifier(fname))
                            ],
                            t.stringLiteral('babel-plugin-hyperlit/html.js')
                        )
                    )
                }
            },
            TaggedTemplateExpression(path, state) {
                let fname = state.get('hyperlitName') || 'html'
                if (path.node.tag.name === fname) {
                    const strs = path.node.quasi.quasis.map(e => e.value.raw);
                    const expr = path.node.quasi.expressions;
                    const result = myParse(fname)(strs, ...expr)
                    if (Array.isArray(result)) path.replaceWith(arrayToNode(result))
                    else if (typeof result === 'string') path.replaceWith(t.stringLiteral(result))
                    else path.replaceWith(result)				

                }
			}
        }
    }
}

