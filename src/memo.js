import compile from './compiler.js'

const memo = {}
export default strs => {
    let key = strs.join('|-')
    let f = memo[key]
    if (!f) {
        f = compile(strs)
        memo[key] = f
    }
    return f
}
