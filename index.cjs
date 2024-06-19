'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
const react_1 = require('react')

/**
 *  Only fetch on first render, to re-fetch call reload()
 * @return {data, error, reload}
 * data is undefined and error is undefined: the fetch is not finished
 * data and error never be defined at the same time
 * reload(): returns the result of fetchFn()
 */
function useFetch(fetchFn, // never return undefined
									getInitial // may throw an error
) {
	const [state, setState] = (0, react_1.useState)(() => {
		if (!getInitial)
			return {}
		try {
			return {data: getInitial()}
		} catch (error) {
			return {error}
		}
	})

	async function load() {
		setState({})
		const promise = (async () => fetchFn())() // Promise.try proposal
		try {
			setState({data: await promise}) // https://github.com/reactwg/react-18/discussions/82
		} catch (error) {
			setState({error})
		}
		return promise
	}

	const loadRef = (0, react_1.useRef)(load)
	loadRef.current = load
	const initStateRef = (0, react_1.useRef)(state);
	(0, react_1.useEffect)(() => {
		// only load if data is not available
		if (initStateRef.current.data === undefined && initStateRef.current.error === undefined)
			loadRef.current()
	}, [])
	const reload = (0, react_1.useCallback)(() => loadRef.current(), [])
	return Object.assign(Object.assign({}, state), {reload})
}

module.exports = useFetch
exports.default = useFetch
