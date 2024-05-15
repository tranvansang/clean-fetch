import {useCallback, useEffect, useRef, useState} from 'react'
export type State<T> = {
	data: T
	error?: undefined
} | {
	data?: undefined
	error: unknown
} | {
	data?: undefined
	error?: undefined
}

/**
 *  Only fetch on first render, to re-fetch call reload()
 * @return {data, error, reload}
 * data is undefined and error is undefined: the fetch is not finished
 * data and error never be defined at the same time
 * reload(): returns the result of fetchFn()
 */
export function useFetch<T>(
	fetchFn: () => Promise<T> | T, // never return undefined
	getInitial?: () => T | undefined // may throw an error
): State<T> & {reload(this: void): Promise<T>} {
	const unmountedRef = useRef(false)
	useEffect(() => {
		unmountedRef.current = false
		return () => void (unmountedRef.current = true)
	}, [])

	const [state, setState] = useState<State<T>>(() => {
		if (!getInitial) return {}
		try {
			return {data: getInitial() as T}
		} catch (error) {
			return {error}
		}
	})

	async function load(){
		setState({})
		const promise = (async () => fetchFn())() // Promise.try proposal
		try {
			const data = await promise
			if (!unmountedRef.current) setState({data})
		} catch (error) {
			if (!unmountedRef.current) setState({error})
		}
		return promise
	}

	const loadRef = useRef(load)
	loadRef.current = load

	const initStateRef = useRef(state)
	useEffect(() => {
		// only load if data is not available
		if (initStateRef.current.data === undefined && initStateRef.current.error === undefined) loadRef.current()
	}, [])

	const reload = useCallback(() => loadRef.current(), [])
	return {...state, reload}
}
