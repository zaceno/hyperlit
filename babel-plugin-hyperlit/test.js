const TEXT_NODE = 3
const EMPTY_OBJ = {}
const EMPTY_ARR = []
const createVNode = (type, props, children, node, key, tag) => ({
  type,
  props,
  children,
  node,
  key,
  tag,
})

const text = (value, node) =>
  createVNode(value, EMPTY_OBJ, EMPTY_ARR, node, null, TEXT_NODE)

const h = (type, props, children) =>
  createVNode(
    type,
    props,
    Array.isArray(children) ? children : children == null ? EMPTY_ARR : [children],
    null,
    props.key
  )

function html(tag, props = {}, children = []) {
    if (Array.isArray(tag))
        return tag
            .flat(2)
            .filter((x) => x || x === 0)
            .map((ch) => (typeof ch == 'string' ? text(ch) : typeof ch == 'number' ? text('' + ch) : ch))
    if (typeof tag === 'function') return tag(props, html(children))
    return h(tag, props, html(children))
}

const assert = require('assert').strict
const compare = assert.deepStrictEqual
const babel = require('@babel/core')
const pluginFn = require('./index.js')
const config = {plugins: [babel.createConfigItem(pluginFn)]}
const transform = inp => babel.transformSync(inp, config).code
const test = (message, input, expected) => compare(
    eval(transform(input)),
    expected,
    message
)

test(
    'simple tag - space before close', 
    `html\`<foo />\``,
    h('foo', {})
)


test(
    'simple tag - immediate close',
    `html\`<foo/>\``,
    h('foo', {})
)

test(
    'tag with one prop - no close spase',
    `html\`<foo bar="baz"/>\``,
    h('foo', { bar: 'baz' })
)


test(
    'tag with one prop - with close space',
    `html\`<foo bar="baz" />\``,
    h('foo', { bar: 'baz' })
)

test(
    'tag with multple props - no close space',
    `html\`<foo bar="baz" bop="zap"/>\``,
    h('foo', { bar: 'baz', bop: 'zap' })
)


test('tag with multple props - close space',
    `html\`<foo   bar="baz" bop="zap"   />\``,
    h('foo', { bar: 'baz', bop: 'zap' })
)

test(
    'tag with child text',
    `html\`<foo>bar</foo>\``,
    h('foo', {}, text('bar'))
)

test(
    'tag with single child',
    `html\`<foo><bar /></foo>\``,
    h('foo', {}, [h('bar', {})])
)

test(
    'tag with multiple children',
    `html\`<foo><bar/><baz /></foo>\``,
    h('foo', {}, [h('bar', {}), h('baz', {})])
)

test(
    'tag with mixed tag/string children',
    `html\`<foo>yip<bar />yap</foo>\``,
    h('foo', {}, [text('yip'), h('bar', {}), text('yap')])
)

test(
    'tag with one prop one child', 
    `html\`<foo bar="baz"><bop /></foo>\``,
    h('foo', { bar: 'baz' }, [h('bop', {})])
)

test(
    'with props and mixed multiple children',
    `html\`<foo a="b" x="y">yip<bar b="c" p="q"/>yap<baz c="d" />yup</foo>\``,
    h('foo', { a: 'b', x: 'y' }, [
        text('yip'),
        h('bar', { b: 'c', p: 'q' }),
        text('yap'),
        h('baz', { c: 'd' }),
        text('yup'),
    ])
)

test(
    'deep complicated but static tree',
    `
html\`<div>
    Some where
    <foo bar="baz">
        <bar baz="bop" />
        over the rainbow
        <baz bop="bat">
            blue birds fly
        </baz>
        birds fly over the rainbow
        <zip />
    </foo>
    Why then, oh why can't I
</div>\`
    `,
    h('div', {}, [
        text('Some where'),
        h('foo', { bar: 'baz' }, [
            h('bar', { baz: 'bop' }),
            text('over the rainbow'),
            h('baz', { bop: 'bat' }, [text('blue birds fly')]),
            text('birds fly over the rainbow'),
            h('zip', {}),
        ]),
        text("Why then, oh why can't I"),
    ])
)

test(
    'one variable prop',
    `html\`<foo bar=\${42} />\``,
    h('foo', { bar: 42 })
)

test(
    'several variable prop',
    `html\`<foo bar=\${42} baz="foo" bat-dat=$\{false} />\``,
    h('foo', { bar: 42, baz: 'foo', 'bat-dat': false })
)
test(
    'dynamic content with single child',
    `html\`<foo>\${html\`<bar/>\`}</foo>\``,
    h('foo', {}, [h('bar', {})])
)
test(
    'dynamic content with two children',
    `html\`<foo>\${html\`<bar/><baz />\`}</foo>\``,
    h('foo', {}, [h('bar', {}), h('baz', {})])
)



test(
    'mixed static/dynamic content', 
    `html\`<foo><bar/>\${html\`<car/><caz />\`}<dar/><daz/>\${html\`<tar />\`}</foo>\``,
    h('foo', {}, [h('bar', {}), h('car', {}), h('caz', {}), h('dar', {}), h('daz', {}), h('tar', {})])
)

test(
    'plain string dynamic content',
    `html\`<foo>\${html\`bar\`}</foo>\``,
    h('foo', {}, [text('bar')])
)

test(
    'mixed text/dynamic content',
    `html\`<foo>bar\${html\`<baz />\`}</foo>\``,
    h('foo', {}, [text('bar'), h('baz', {}, [])])
)

test(
    'mixed static/dynamic, text, multi depth with props', 
    `html\`
        
        <div>
        Some where
        <foo bar="baz">
            <bar baz="bop" />
            over the rainbow \${html\`
            <baz bop="bat">
                blue birds fly
            </baz>
                birds fly over the rainbow
            \`}
            <zip />
        </foo>
        \${html\`Why then, oh why can't I\`}
    </div>
    \``,
    h('div', {}, [
        text('Some where'),
        h('foo', { bar: 'baz' }, [
            h('bar', { baz: 'bop' }),
            text('over the rainbow '),
            h('baz', { bop: 'bat' }, [text('blue birds fly')]),
            text('birds fly over the rainbow'),
            h('zip', {}),
        ]),
        text("Why then, oh why can't I")
    ]),
)

test(
    'An array of content', 
    `html\`<foo>\${['bar', 'baz', 'bop'].map((n) => html\`<x prop=\${n}>\${n}</x>\`)}</foo>\``,
    h('foo', {}, [
        h('x', { prop: 'bar' }, [text('bar')]),
        h('x', { prop: 'baz' }, [text('baz')]),
        h('x', { prop: 'bop' }, [text('bop')]),
    ]),
)

test(
    'prop-spread',
    `html\`<foo ...\${{ bar: 2, baz: 3 }} />\``,
    h('foo', { bar: 2, baz: 3 })
)

test(
    'simple component', 
    `
    const component = () => html\`<bar/>\`
    html\`<foo><\${component} /></foo>\`
    `,
    h('foo', {}, [h('bar', {})])
)

test(
    'component with props', 
    `
    const component = (props) => html\`<bar myprop="1" extprop=\${props.prop} />\`
    html\`<foo><\${component} prop="aaa" /></foo>\`
    `,
    h('foo', {}, [h('bar', { myprop: '1', extprop: 'aaa' })])
)


test(
    'component with just children - close with string', 
    `
    const component = (_, children) => html\`<bar><ownchild />\${children}<ownchild /></bar>\`
    html\`<foo><\${component}><aaa /><bbb /><//>\${html\`hello\`}</foo>\`
    `,
    h('foo', {}, [
        h('bar', {}, [h('ownchild', {}), h('aaa', {}), h('bbb', {}), h('ownchild', {})]),
        text('hello'),
    ])
)

test(
    'component with just children - close with compoenent', 
    `
    const component = (_, children) => html\`<bar><ownchild />\${children}<ownchild /></bar>\`
    html\`<foo><\${component}><aaa /><bbb /></\${component}>\${html\`hello\`}</foo>\`
    `,
    h('foo', {}, [
        h('bar', {}, [h('ownchild', {}), h('aaa', {}), h('bbb', {}), h('ownchild', {})]),
        text('hello'),
    ])
)

test(
    'deep components',
    `
    const component = (props, children) => html\`
        <component ownprop="yes" extprop=\${props.foo}>
            <h1>\${props.bar}</h1>
            \${children}
        </component>
    \`
    html\`
        <main>
            <div>
                <h1>outer title</h1>
                <\${component} foo="a" bar="b">
                    <p>inner text</p>
                    <\${component} foo="c" bar="d" />
                <//>
            </div>
            <\${component} foo="e" bar="f">
                <p>other text</p>
            <//>
        </main>
    \`
    `,
    h('main', {}, [
        h('div', {}, [
            h('h1', {}, [text('outer title')]),
            h('component', { ownprop: 'yes', extprop: 'a' }, [
                h('h1', {}, [text('b')]),
                h('p', {}, [text('inner text')]),
                h('component', { ownprop: 'yes', extprop: 'c' }, [h('h1', {}, [text('d')])]),
            ]),
        ]),
        h('component', { ownprop: 'yes', extprop: 'e' }, [h('h1', {}, [text('f')]), h('p', {}, [text('other text')])]),
    ])
)



test(
    'spread without ellipsis', 
    `html\`<foo bar="aaa" \${{ bar: 'bbb', bat: 'zzz' }} bar=\${'ccc'} />\``,
    h('foo', {
        bar: 'ccc',
        bat: 'zzz',
    })
)


test(
    'whitespace to placeholders preserved',
    `
    const name = 'Georgia'
    html\`<foo>Hello \${name} my dear!</foo>\`
    `,
    h('foo', {}, [text('Hello '), text('Georgia'), text(' my dear!')])
)

test(
    'whitespace between placeholders preserved', 
    `
    const foo = 'foo'
    const bar = 'bar'
    html\`
            <q>
                aaa \${foo} \${bar} bbb
            </q>\`
    `,
    h('q', {}, [text('aaa '), text('foo'), text(' '), text('bar'), text(' bbb')])
)

test(
    'value-less props default to true - last ',
    `html\`<button disabled>foo</button>\``,
    h('button', { disabled: true }, [text('foo')])
)


test(
    'value-less props default to true - mixed ',
    `html\`<button disabled foo="bar">foo</button>\``,
    h('button', { disabled: true, foo: 'bar' }, [text('foo')])
)

test(
    'value-less props default to true - multiple ', 
    `html\`<button disabled foo="bar" hidden>foo</button>\``,
    h('button', { disabled: true, foo: 'bar', hidden: true }, [text('foo')])
)

test(
    'value-less props default to true - selfclosing', 
    `html\`<button hidden disabled/>\``,
    h('button', { hidden: true, disabled: true }, [])
)

test(
    'dynamic propval in quotes should work',
    `
    const baz = 'bop'
    html\`<foo bar="\${baz}"/>\`
    `,
    h('foo', { bar: 'bop' })
)



test(
    'dynamic propval in quotes should be cast to string', 
    `
    const baz = 42
    html\`<foo bar="\${baz}"/>\`
    `,
    h('foo', { bar: '42' })
)

test(
    'dynamic string inserted in prop-vals', 
    `
    const baz = 42
    html\`<foo bar="a\${baz}z"/>\`
    `,
    h('foo', { bar: 'a42z' })
)

test(
    'falsy dynamic content is cast to string',
    `html\`<foo>\${0}</foo>\``,
    h('foo', {}, [text('0')])
)

test(
    'compose arrays of arrays - 1',
    `
    let aaa = html\`<aaa/><bbb/>\`
    let ccc = html\`<ccc/><ddd/>\`
    html\`\${aaa}\${ccc}\`
    `,
    [
        h('aaa', {}),
        h('bbb', {}),
        h('ccc', {}),
        h('ddd', {}),
    ]
)



test(
    'compose arrays of arrays - 2',
    `
    let aaa = html\`<aaa/><bbb/>\`
    let ccc = html\`<ccc/><ddd/>\`
    html\`<div>\${[aaa, ccc]}</div>\`
    `,
    h('div', {}, [
        h('aaa', {}),
        h('bbb', {}),
        h('ccc', {}),
        h('ddd', {}),
    ])
)

test(
    'compose arrays of arrays - 3',
    `
    let aaa = html\`<aaa/><bbb/>\`
    let ccc = html\`<ccc/><ddd/>\`
    html\`\${[aaa, ccc]}\`
    `,
    [
        h('aaa', {}),
        h('bbb', {}),
        h('ccc', {}),
        h('ddd', {}),
    ]
)


test(
    'whitespace between element and text preserved',
    `
    html\`
            <div>
                <span>a</span> b
            </div>\`
    `,
    h('div', {}, [h('span', {}, [text('a')]), text(' b')]),
)

test(
    'numeric values in content cast to strings',
    `html\`<div>My age: \${42}</div>\``,
    h('div', {}, [text('My age: '), text('42')])
)


test(
    'preserve whitespace before element',
    `
    html\`<foo>aaa <bar>bbb</bar>ccc</foo>\`
    `,
    h('foo', {}, [
        text('aaa '),
        h('bar', {}, [
            text('bbb')
        ]),
        text('ccc')
    ])
)

test(
    'preserve whitespace after element',
    `
    html\`<foo>aaa<bar>bbb</bar> ccc</foo>\`
    `,
    h('foo', {}, [
        text('aaa'),
        h('bar', {}, [
            text('bbb')
        ]),
        text(' ccc')
    ])
)