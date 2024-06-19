import { useCallback, useEffect, useRef, useState } from 'react';
/**
 *  Only fetch on first render, to re-fetch call reload()
 * @return {data, error, reload}
 * data is undefined and error is undefined: the fetch is not finished
 * data and error never be defined at the same time
 * reload(): returns the result of fetchFn()
 */
export default function useFetch(fetchFn, // never return undefined
																 getInitial // may throw an error
) {
	const [state, setState] = useState(() => {
		if (!getInitial)
			return {};
		try {
			return { data: getInitial() };
		}
		catch (error) {
			return { error };
		}
	});
	async function load() {
		setState({});
		const promise = (async () => fetchFn())(); // Promise.try proposal
		try {
			setState({ data: await promise }); // https://github.com/reactwg/react-18/discussions/82
		}
		catch (error) {
			setState({ error });
		}
		return promise;
	}
	const loadRef = useRef(load);
	loadRef.current = load;
	const initStateRef = useRef(state);
	useEffect(() => {
		// only load if data is not available
		if (initStateRef.current.data === undefined && initStateRef.current.error === undefined)
			loadRef.current();
	}, []);
	const reload = useCallback(() => loadRef.current(), []);
	return Object.assign(Object.assign({}, state), { reload });
}
