import test from 'ava'
import x from './index.js'
import { h } from 'hyperapp'

const trimWhitespace = node => {
    if (node.type === 3) {
        let name = node.name.trim()
        if (name === '') return false
        return { ...node, name: node.name.trim() }
    } else {
        return {
            ...node,
            children: node.children.map(trimWhitespace).filter(n => !!n),
        }
    }
}

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
        trimWhitespace(x`<div>
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
        </div>`),
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
