import {useState, useEffect, useCallback, useRef} from 'react'

/**
 * @return {data, error, reload}
 * data is undefined and error is undefined: the fetch is not finished yet
 * data is defined: error must be undefined
 * reload(): returns the result of fetchFn()
 */
function useFetch_<T>(fetchFn: () => Promise<T> | T) {
	const unmountedRef = useRef(false)
	useEffect(() => {
		unmountedRef.current = false
		return () => void (unmountedRef.current = true)
	})

	const [{data, error}, setState] = useState<{
		data: T
		error: undefined
	} | {
		data: undefined
		error: Error
	}>({})
	const load = useCallback((cancelledRef?: {current: boolean}) => {
		setState(() => ({}))
		let promise
		try {
			promise = fetchFn()
			if (typeof promise?.then === 'function') {
				promise.then(data => {
					if (!(cancelledRef ?? unmountedRef).current) setState({data})
				}).catch(error => {
					if (!(cancelledRef ?? unmountedRef).current) setState({error})
				})
			} else {
				setState({data: promise})
			}
			return promise
		} catch (error) {
			setState({error})
		}
	}, [fetchFn])

	const reload = useCallback(() => load(), [load])

	return {data, error, load, reload}
}

//Only fetch on first render, to re-fetch call reload()
export function useFetch<T>(fetchFn: () => Promise<T> | T) {
	const {data, error, load, reload} = useFetch_(fetchFn)
	useEffect(() => void load(), [])
	return {data, error, reload}
}

// Always re-fetch when `fetchFn` changes
export function useFetchAlways<T>(fetchFn: () => Promise<T> | T) {
	const {data, error, load, reload} = useFetch_(fetchFn)
	useEffect(() => {
		const cancelledRef = {current: false}
		load(cancelledRef)
		return () => void (cancelledRef.current = true)
	}, [load])
	return {data, error, reload}
}
