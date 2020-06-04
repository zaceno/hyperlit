import getFunc from './memo.js'
export default (strs, ...vals) => getFunc(strs)(vals)
