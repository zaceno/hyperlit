import test from 'ava'
import x from './index.js'
import { h } from 'hyperapp'

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

test.todo('An array of content')
test.todo('conditional rendering - skip empty/nullish ')
test.todo('whitespace')
test.todo('prop-spread?')
test.todo('components?')
