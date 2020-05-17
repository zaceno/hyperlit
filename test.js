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

test.only('tag with child text', t =>
    t.deepEqual(x`<foo>bar</foo>`, h('foo', {}, 'bar')))
