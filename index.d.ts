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
export default function useFetch<T>(fetchFn: () => Promise<T> | T, // never return undefined
																		getInitial?: () => T | undefined): State<T> & {
	reload(this: void): Promise<T>
}
