import { h } from 'hyperapp'
import test from 'ava'
import x from '../dist/index.js'

test('simple tag - space before close', t => t.deepEqual(x`<foo />`, h('foo')))
test('simple tag - immediate close', t => t.deepEqual(x`<foo/>`, h('foo')))
test('tag with one prop - no close spase', t =>
    t.deepEqual(x`<foo bar="baz"/>`, h('foo', { bar: 'baz' })))

test('tag with one prop - with close space', t =>
    t.deepEqual(x`<foo bar="baz" />`, h('foo', { bar: 'baz' })))

test('tag with multple props - no close space', t => {
    t.deepEqual(
        x`<foo bar="baz"   bop="zap"/>`,
        h('foo', { bar: 'baz', bop: 'zap' })
    )
})

test('tag with multple props - close space', t => {
    t.deepEqual(
        x`<foo   bar="baz" bop="zap"   />`,
        h('foo', { bar: 'baz', bop: 'zap' })
    )
})
test('tag with child text', t =>
    t.deepEqual(x`<foo>bar</foo>`, h('foo', {}, 'bar')))

test('tag with single child', t =>
    t.deepEqual(x`<foo><bar /></foo>`, h('foo', {}, [h('bar', {})])))

test('tag with multiple children', t =>
    t.deepEqual(
        x`<foo><bar/><baz /></foo>`,
        h('foo', {}, [h('bar', {}), h('baz', {})])
    ))

test('tag with mixed tag/string children', t => {
    t.deepEqual(
        x`<foo>yip<bar />yap</foo>`,
        h('foo', {}, ['yip', h('bar', {}), 'yap'])
    )
})

test('tag with one prop one child', t =>
    t.deepEqual(
        x`<foo bar="baz"><bop /></foo>`,
        h('foo', { bar: 'baz' }, [h('bop', {})])
    ))

test('with props and mixed multiple children', t => {
    t.deepEqual(
        x`<foo a="b" x="y">yip<bar b="c" p="q"/>yap<baz c="d" />yup</foo>`,
        h('foo', { a: 'b', x: 'y' }, [
            'yip',
            h('bar', { b: 'c', p: 'q' }),
            'yap',
            h('baz', { c: 'd' }),
            'yup',
        ])
    )
})

test('deep complicated but static tree', t =>
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
            'Some where',
            h('foo', { bar: 'baz' }, [
                h('bar', { baz: 'bop' }),
                'over the rainbow',
                h('baz', { bop: 'bat' }, ['blue birds fly']),
                'birds fly over the rainbow',
                h('zip', {}),
            ]),
            "Why then, oh why can't I",
        ])
    ))
test('one variable prop', t =>
    t.deepEqual(x`<foo bar=${42} />`, h('foo', { bar: 42 })))

test('several variable prop', t =>
    t.deepEqual(
        x`<foo bar=${42} baz="foo" bat-dat=${false} />`,
        h('foo', { bar: 42, baz: 'foo', 'bat-dat': false })
    ))

test('dynamic content with single child', t =>
    t.deepEqual(x`<foo>${x`<bar/>`}</foo>`, h('foo', {}, [h('bar', {})])))

test('dynamic content with two children', t =>
    t.deepEqual(
        x`<foo>${x`<bar/><baz />`}</foo>`,
        h('foo', {}, [h('bar', {}), h('baz', {})])
    ))

test('mixed static/dynamic content', t =>
    t.deepEqual(
        x`<foo><bar/>${x`<car/><caz />`}<dar/><daz/>${x`<tar />`}</foo>`,
        h('foo', {}, [
            h('bar', {}),
            h('car', {}),
            h('caz', {}),
            h('dar', {}),
            h('daz', {}),
            h('tar', {}),
        ])
    ))

test('plain string dynamic content', t =>
    t.deepEqual(x`<foo>${x`bar`}</foo>`, h('foo', {}, ['bar'])))

test('mixed text/dynamic content', t =>
    t.deepEqual(
        x`<foo>bar${x`<baz />`}</foo>`,
        h('foo', {}, ['bar', h('baz', {}, [])])
    ))

test('mixed static/dynamic, text, multi depth with props', t =>
    t.deepEqual(
        x`
        
        <div>
        Some where
        <foo bar="baz">
            <bar baz="bop" />
            over the rainbow
            ${x`
            <baz bop="bat">
                blue birds fly
            </baz>
                birds fly over the rainbow
            `}
            <zip />
        </foo>
        ${x`Why then, oh why can't I`}
    </div>`,
        h('div', {}, [
            'Some where',
            h('foo', { bar: 'baz' }, [
                h('bar', { baz: 'bop' }),
                'over the rainbow',
                h('baz', { bop: 'bat' }, ['blue birds fly']),
                'birds fly over the rainbow',
                h('zip', {}),
            ]),
            "Why then, oh why can't I",
        ])
    ))

test('An array of content', t =>
    t.deepEqual(
        x`<foo>${['bar', 'baz', 'bop'].map(
            n => x`<x prop=${n}>${n}</x>`
        )}</foo>`,
        h('foo', {}, [
            h('x', { prop: 'bar' }, ['bar']),
            h('x', { prop: 'baz' }, ['baz']),
            h('x', { prop: 'bop' }, ['bop']),
        ])
    ))

test('conditional rendering - skip empty/nullish ', t =>
    t.deepEqual(
        x`<foo>${[
            false && 'false',
            true && x`truetext`,
            false && 'false',
            true && x`<truenode/>`,
            false && 'false',
        ]}</foo>`,
        h('foo', {}, ['truetext', h('truenode', {})])
    ))

test('prop-spread', t =>
    t.deepEqual(
        x`<foo ...${{ bar: 2, baz: 3 }} />`,
        h('foo', { bar: 2, baz: 3 })
    ))

test('simple component', t => {
    const component = () => x`<bar/>`
    const result = x`<foo><${component} /></foo>`
    const expected = h('foo', {}, [h('bar', {})])
    t.deepEqual(expected, result)
})

test('component with props', t => {
    const component = props => x`<bar myprop="1" extprop=${props.prop} />`
    const result = x`<foo><${component} prop="aaa" /></foo>`
    const expected = h('foo', {}, [h('bar', { myprop: '1', extprop: 'aaa' })])
    t.deepEqual(expected, result)
})

test('component with just children - close with string', t => {
    const component = (_, children) =>
        x`<bar><ownchild />${children}<ownchild /></bar>`
    const result = x`<foo><${component}><aaa /><bbb /><//>${x`hello`}</foo>`
    const expected = h('foo', {}, [
        h('bar', {}, [
            h('ownchild', {}),
            h('aaa', {}),
            h('bbb', {}),
            h('ownchild', {}),
        ]),
        'hello',
    ])
    t.deepEqual(expected, result)
})
test('component with just children - close with compoenent', t => {
    const component = (_, children) =>
        x`<bar><ownchild />${children}<ownchild /></bar>`
    const result = x`<foo><${component}><aaa /><bbb /></${component}>${x`hello`}</foo>`
    const expected = h('foo', {}, [
        h('bar', {}, [
            h('ownchild', {}),
            h('aaa', {}),
            h('bbb', {}),
            h('ownchild', {}),
        ]),
        'hello',
    ])
    t.deepEqual(expected, result)
})

test('deep components', t => {
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
            h('h1', {}, ['outer title']),
            h('component', { ownprop: 'yes', extprop: 'a' }, [
                h('h1', {}, ['b']),
                h('p', {}, ['inner text']),
                h('component', { ownprop: 'yes', extprop: 'c' }, [
                    h('h1', {}, ['d']),
                ]),
            ]),
        ]),
        h('component', { ownprop: 'yes', extprop: 'e' }, [
            h('h1', {}, ['f']),
            h('p', {}, ['other text']),
        ]),
    ])
    t.deepEqual(result, expect)
})

test('it should also work to have dynamic prop in quotes', t =>
    t.deepEqual(
        x`<foo bar="${42}" baz="42" bat=${false} />`,
        h('foo', { bar: 42, baz: '42', bat: false })
    ))

test('spread without ellipsis', t =>
    t.deepEqual(
        x`<foo bar="aaa" ${{ bar: 'bbb', bat: 'zzz' }} bar=${'ccc'} />`,
        h('foo', {
            bar: 'ccc',
            bat: 'zzz',
        })
    ))
