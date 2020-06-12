
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
            list.push(h(tagname, props, children))
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
            props = [{}]
            mode = m
        }

        const gotContent = () => {
            if(vals[j]) list.push(vals[j])
        }

        const defaultProp = (m = mode) => {
            props[0][buffer] = true
            mode = m
        }

        const gotProp = v => {
            props[0][propname] = v
            mode = PROPS
        }

        for (j = jstart; j < strs.length; j++) {
            for (i = istart; i < strs[j].length; i++) {
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
                    } else if (ws(ch)) {
                        defaultProp(PROPS)
                    } else {
                        buffer += ch
                    }
                } else if (mode == PROPVAL) {
                    if (ch == '"') {
                        mode = PROPVALSTR
                        buffer = ['']
                    }
                } else if (mode == PROPVALSTR) {
                    if (ch == '"') {
                        gotProp(buffer)
                    } else {
                        buffer[buffer.length - 1] += ch
                    }
                }
            }
            istart = 0
            if (mode == TAG) {
                tagname = vals[j]
                props = [{}]
                mode = PROPS
            } else if (mode == TEXT) {
                gotText(!vals[j])
                gotContent()
            } else if (mode == PROPS) {
                props = [ ...props, vals[j] ]
            } else if (mode == PROPVAL) {
                gotProp(vals[j])
            } else if (mode == PROPVALSTR) {
                buffer.push(vals[j]) 
            } else if (mode == NEXT) {
                gotContent()
            }
        }

        return [list.length == 1 ? list[0] : list, j, i]
    }

    return (strs, ...vals) => parse(strs, vals, 0, 0)[0]
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
            let values = obj[key].map ? obj[key] : [obj[key]]
            values = values.map(valueOrNode =>  t.isNode(valueOrNode) ? valueOrNode : t.valueToNode(valueOrNode))

			let node = values[0];
			if (values.length > 1 && !t.isStringLiteral(node) && !t.isStringLiteral(values[1])) {
				node = t.binaryExpression('+', t.stringLiteral(''), node);
			}
			values.slice(1).forEach(value => {
				node = t.binaryExpression('+', node, value);
            });
            
			return t.objectProperty(propertyName(key), node);
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
        let schildren = t.arrayExpression((children || []).map(v => t.isNode(v) ? v : t.valueToNode(v)))
        return t.callExpression(t.identifier(fname), [stag, sprops, schildren])
    })


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
                let fname = state.get('hyperlitName')
                if (path.node.tag.name === fname) {
                    const strs = path.node.quasi.quasis.map(e => e.value.raw);
                    const expr = path.node.quasi.expressions;
                    path.replaceWith(myParse(fname)(strs, ...expr))				

                }
			}
        }
    }
}

