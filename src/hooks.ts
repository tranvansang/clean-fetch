import {useCallback, useEffect, useRef, useState} from 'react'

/**
 *  Only fetch on first render, to re-fetch call reload()
 * @return {data, error, reload}
 * data is undefined and error is undefined: the fetch is not finished yet
 * data is defined: error must be undefined
 * reload(): returns the result of fetchFn()
 */
export function useFetch<T>(fetchFn: () => Promise<T>) {
	const unmountedRef = useRef(false)
	useEffect(() => {
		unmountedRef.current = false
		return () => void (unmountedRef.current = true)
	})

	const [{data, error}, setState] = useState<{data?: T, error?: Error}>({})
	const load = useCallback((cancelledRef?: {current: boolean}) => {
		setState(() => ({}))
		let promise
		promise = fetchFn()
		promise.then(data => {
			if (!(cancelledRef ?? unmountedRef).current) setState({data})
		}).catch((error: any) => {
			if (!(cancelledRef ?? unmountedRef).current) setState({error})
		})
		return promise
	}, [fetchFn])

	useEffect(() => void load(), [])
	const reload = useCallback(() => load(), [load])

	return {data: data as T, error: error as Error, load, reload}
}
