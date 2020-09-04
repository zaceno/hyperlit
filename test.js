import { h, text } from 'hyperapp'
import test from 'ava'
import x from './index.js'

test('simple tag - space before close', (t) => t.deepEqual(x`<foo />`, h('foo', {})))
test('simple tag - immediate close', (t) => t.deepEqual(x`<foo/>`, h('foo', {})))
test('tag with one prop - no close spase', (t) => t.deepEqual(x`<foo bar="baz"/>`, h('foo', { bar: 'baz' })))

test('tag with one prop - with close space', (t) => t.deepEqual(x`<foo bar="baz" />`, h('foo', { bar: 'baz' })))

test('tag with multple props - no close space', (t) => {
    t.deepEqual(x`<foo bar="baz" bop="zap"/>`, h('foo', { bar: 'baz', bop: 'zap' }))
})
test('tag with multple props - close space', (t) => {
    t.deepEqual(x`<foo   bar="baz" bop="zap"   />`, h('foo', { bar: 'baz', bop: 'zap' }))
})
test('tag with child text', (t) => t.deepEqual(x`<foo>bar</foo>`, h('foo', {}, text('bar'))))

test('tag with single child', (t) => t.deepEqual(x`<foo><bar /></foo>`, h('foo', {}, [h('bar', {})])))

test('tag with multiple children', (t) =>
    t.deepEqual(x`<foo><bar/><baz /></foo>`, h('foo', {}, [h('bar', {}), h('baz', {})])))

test('tag with mixed tag/string children', (t) => {
    t.deepEqual(x`<foo>yip<bar />yap</foo>`, h('foo', {}, [text('yip'), h('bar', {}), text('yap')]))
})

test('tag with one prop one child', (t) =>
    t.deepEqual(x`<foo bar="baz"><bop /></foo>`, h('foo', { bar: 'baz' }, [h('bop', {})])))

test('with props and mixed multiple children', (t) => {
    t.deepEqual(
        x`<foo a="b" x="y">yip<bar b="c" p="q"/>yap<baz c="d" />yup</foo>`,
        h('foo', { a: 'b', x: 'y' }, [
            text('yip'),
            h('bar', { b: 'c', p: 'q' }),
            text('yap'),
            h('baz', { c: 'd' }),
            text('yup'),
        ]),
    )
})

test('deep complicated but static tree', (t) =>
    t.deepEqual(
        x`<div>
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
        </div>`,
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
        ]),
    ))
test('one variable prop', (t) => t.deepEqual(x`<foo bar=${42} />`, h('foo', { bar: 42 })))

test('several variable prop', (t) =>
    t.deepEqual(x`<foo bar=${42} baz="foo" bat-dat=${false} />`, h('foo', { bar: 42, baz: 'foo', 'bat-dat': false })))

test('dynamic content with single child', (t) => t.deepEqual(x`<foo>${x`<bar/>`}</foo>`, h('foo', {}, [h('bar', {})])))

test('dynamic content with two children', (t) =>
    t.deepEqual(x`<foo>${x`<bar/><baz />`}</foo>`, h('foo', {}, [h('bar', {}), h('baz', {})])))

test('mixed static/dynamic content', (t) =>
    t.deepEqual(
        x`<foo><bar/>${x`<car/><caz />`}<dar/><daz/>${x`<tar />`}</foo>`,
        h('foo', {}, [h('bar', {}), h('car', {}), h('caz', {}), h('dar', {}), h('daz', {}), h('tar', {})]),
    ))

test('plain string dynamic content', (t) => t.deepEqual(x`<foo>${x`bar`}</foo>`, h('foo', {}, [text('bar')])))

test('mixed text/dynamic content', (t) =>
    t.deepEqual(x`<foo>bar${x`<baz />`}</foo>`, h('foo', {}, [text('bar'), h('baz', {}, [])])))

test('mixed static/dynamic, text, multi depth with props', (t) =>
    t.deepEqual(
        x`
        
        <div>
        Some where
        <foo bar="baz">
            <bar baz="bop" />
            over the rainbow ${x`
            <baz bop="bat">
                blue birds fly
            </baz>
                birds fly over the rainbow
            `}
            <zip />
        </foo>
        ${x`Why then, oh why can't I`}
    </div>
    `,
        h('div', {}, [
            text('Some where'),
            h('foo', { bar: 'baz' }, [
                h('bar', { baz: 'bop' }),
                text('over the rainbow '),
                h('baz', { bop: 'bat' }, [text('blue birds fly')]),
                text('birds fly over the rainbow'),
                h('zip', {}),
            ]),
            text("Why then, oh why can't I"),
        ]),
    ))

test('An array of content', (t) =>
    t.deepEqual(
        x`<foo>${['bar', 'baz', 'bop'].map((n) => x`<x prop=${n}>${n}</x>`)}</foo>`,
        h('foo', {}, [
            h('x', { prop: 'bar' }, [text('bar')]),
            h('x', { prop: 'baz' }, [text('baz')]),
            h('x', { prop: 'bop' }, [text('bop')]),
        ]),
    ))

test('prop-spread', (t) => t.deepEqual(x`<foo ...${{ bar: 2, baz: 3 }} />`, h('foo', { bar: 2, baz: 3 })))

test('simple component', (t) => {
    const component = () => x`<bar/>`
    const result = x`<foo><${component} /></foo>`
    const expected = h('foo', {}, [h('bar', {})])
    t.deepEqual(expected, result)
})

test('component with props', (t) => {
    const component = (props) => x`<bar myprop="1" extprop=${props.prop} />`
    const result = x`<foo><${component} prop="aaa" /></foo>`
    const expected = h('foo', {}, [h('bar', { myprop: '1', extprop: 'aaa' })])
    t.deepEqual(expected, result)
})

test('component with just children - close with string', (t) => {
    const component = (_, children) => x`<bar><ownchild />${children}<ownchild /></bar>`
    const result = x`<foo><${component}><aaa /><bbb /><//>${x`hello`}</foo>`
    const expected = h('foo', {}, [
        h('bar', {}, [h('ownchild', {}), h('aaa', {}), h('bbb', {}), h('ownchild', {})]),
        text('hello'),
    ])
    t.deepEqual(expected, result)
})
test('component with just children - close with compoenent', (t) => {
    const component = (_, children) => x`<bar><ownchild />${children}<ownchild /></bar>`
    const result = x`<foo><${component}><aaa /><bbb /></${component}>${x`hello`}</foo>`
    const expected = h('foo', {}, [
        h('bar', {}, [h('ownchild', {}), h('aaa', {}), h('bbb', {}), h('ownchild', {})]),
        text('hello'),
    ])
    t.deepEqual(expected, result)
})

test('deep components', (t) => {
    const component = (props, children) => x`
        <component ownprop="yes" extprop=${props.foo}>
            <h1>${props.bar}</h1>
            ${children}
        </component>
    `
    const result = x`
        <main>
            <div>
                <h1>outer title</h1>
                <${component} foo="a" bar="b">
                    <p>inner text</p>
                    <${component} foo="c" bar="d" />
                <//>
            </div>
            <${component} foo="e" bar="f">
                <p>other text</p>
            <//>
        </main>
    `
    const expect = h('main', {}, [
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
    t.deepEqual(result, expect)
})

test('spread without ellipsis', (t) =>
    t.deepEqual(
        x`<foo bar="aaa" ${{ bar: 'bbb', bat: 'zzz' }} bar=${'ccc'} />`,
        h('foo', {
            bar: 'ccc',
            bat: 'zzz',
        }),
    ))

test('whitespace to placeholders preserved', (t) => {
    const name = 'Georgia'
    t.deepEqual(
        x`<foo>Hello ${name} my dear!</foo>`,
        h('foo', {}, [text('Hello '), text('Georgia'), text(' my dear!')]),
    )
})

test('whitespace between placeholders preserved', (t) => {
    const foo = 'foo'
    const bar = 'bar'
    t.deepEqual(
        x`
            <q>
                aaa ${foo} ${bar} bbb
            </q>`,
        h('q', {}, [text('aaa '), text('foo'), text(' '), text('bar'), text(' bbb')]),
    )
})


test('preserve whitespace before element', t => t.deepEqual(
    x`<foo>aaa <bar>bbb</bar>ccc</foo>`,
    h('foo', {}, [
        text('aaa '),
        h('bar', {}, [
            text('bbb')
        ]),
        text('ccc'),
    ])
))

test('preserve whitespace after element', t => t.deepEqual(
    x`<foo>aaa<bar>bbb</bar> ccc</foo>`,
    h('foo', {}, [
        text('aaa'),
        h('bar', {}, [
            text('bbb')
        ]),
        text(' ccc'),
    ])
))

test('whitespace between element and text preserved', (t) => {
    t.deepEqual(
        x`
            <div>
                <span>a</span> b
            </div>`,
        h('div', {}, [h('span', {}, [text('a')]), text(' b')]),
    )
})

test('numeric values in content cast to strings', (t) => {
    t.deepEqual(
        x`<div>My age: ${42}</div>`,
        h('div', {}, [text('My age: '), text('42')])
    )
})

test('value-less props default to true - last ', (t) =>
    t.deepEqual(x`<button disabled>foo</button>`, h('button', { disabled: true }, [text('foo')])))

test('value-less props default to true - mixed ', (t) =>
    t.deepEqual(x`<button disabled foo="bar">foo</button>`, h('button', { disabled: true, foo: 'bar' }, [text('foo')])))

test('value-less props default to true - multiple ', (t) =>
    t.deepEqual(
        x`<button disabled foo="bar" hidden>foo</button>`,
        h('button', { disabled: true, foo: 'bar', hidden: true }, [text('foo')]),
    ))
test('value-less props default to true - selfclosing', (t) =>
    t.deepEqual(x`<button hidden disabled/>`, h('button', { hidden: true, disabled: true }, [])))

test('dynamic propval in quotes should work', (t) => {
    const baz = 'bop'
    t.deepEqual(x`<foo bar="${baz}"/>`, h('foo', { bar: 'bop' }))
})

test('dynamic propval in quotes should be cast to string', (t) => {
    const baz = 42
    t.deepEqual(x`<foo bar="${baz}"/>`, h('foo', { bar: '42' }))
})

test('dynamic string inserted in prop-vals', (t) => {
    const baz = 42
    t.deepEqual(x`<foo bar="a${baz}z"/>`, h('foo', { bar: 'a42z' }))
})

test('falsy dynamic content is cast to string', (t) => t.deepEqual(x`<foo>${0}</foo>`, h('foo', {}, [text('0')])))

test('compose arrays of arrays - 1', t => {
    let aaa = x`<aaa/><bbb/>`
    let ccc = x`<ccc/><ddd/>`
    t.deepEqual(
        x`${aaa}${ccc}`,
        [
            h('aaa', {}),
            h('bbb', {}),
            h('ccc', {}),
            h('ddd', {}),
        ]
    )
})

test('compose arrays of arrays - 2', t => {
    let aaa = x`<aaa/><bbb/>`
    let ccc = x`<ccc/><ddd/>`
    t.deepEqual(
        x`<div>${[aaa, ccc]}</div>`,
        h('div', {}, [
            h('aaa', {}),
            h('bbb', {}),
            h('ccc', {}),
            h('ddd', {}), 
        ])
    )
})

test('compse arrays of arrays - 3', t => {
    let aaa = x`<aaa/><bbb/>`
    let ccc = x`<ccc/><ddd/>`
    t.deepEqual(
        x`${[aaa, ccc]}`,
        [
            h('aaa', {}),
            h('bbb', {}),
            h('ccc', {}),
            h('ddd', {}), 
        ]
    )
})

