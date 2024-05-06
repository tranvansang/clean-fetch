# Clean Fetch

## Simple, Unopinionated, Just Working - React Data Fetching Library

## Installation

```bash
yarn add clean-fetch
```

## Usage

### Hook Usage
```tsx
import {useFetch} from 'clean-fetch'
```

- Signature: `useFetch<T>(fetchfn, getInitial)`.
- `fetchFn: () => Promise<T> | T`: a function that returns the data or a promise which resolves to the data.
- `getInitial?: () => T | undefined`: an optional function that returns the initial data.
If not provided, the initial data is `undefined`.
`getInitial()` can return `undefined`, `getInitial` can be absent, or it can throw an error.
- Returns `{data, error, reload}` where:
	- If `data` and `error` are both `undefined`, it means the data is loading or not yet fetched (initial render).
  They are never both not `undefined`.
	- `reload`: a function that takes no argument, reloads the data and returns what the function passed to the hook returns.
The `reload` function reference never changes, you can safely pass it to the independent array of `useEffect` without causing additional renders.
In subsequent renders, `reload` uses the latest function passed to the hook.

- `useFetch`: only fetches data in the first return, only if initial data is not provided.
If you want to refetch the data, you need to manually call `reload()`.
```typescript
const {data, error, reload} = useFetch(() => fetchData(params))
// when params changes, you need to manually call reload()
useEffect(() => void reload(), [params, reload]) // `reload` value never changes
```

#### Note
- `useHook<T>()` has a generic type `T` which is the type of the data returned by the function passed to the hook.
- When calling `reload()`, `error` and `data` are immediately/synchronously set to `undefined` (via `setState`) and the data is refetched.
- If you want to keep the last data while refetching, for example, to keep the last page of a paginated list until the new page is fetched, you can create a custom hook that retains the last data while fetching the new data.
```typescript
// only update when value is not undefined
export const useKeep = <T>(value: T): T => {
	const ref = useRef(value)
	if (value !== undefined) ref.current = value
	return value ?? ref.current
}
```
This `useKeep` hook is available in [misc-hooks](https://www.npmjs.com/package/misc-hooks) package.
- If you want to delay showing the loading indicator, you should implement that function in caller component.
```tsx
export const useTimedOut = (timeout: number) => {
	const [timedOut, enable] = useReducer(() => true, false)
	useEffect(() => {
		let cancelled = false
		const timer = setTimeout(() => !cancelled && enable(), timeout)
		return () => {
			cancelled = true
			clearTimeout(timer)
		}
	}, [enable, timeout])
	return timedOut
}

const {data, error, reload} = useFetch(() => fetchData(params))
const timedOut = useTimedOut(500)
return error // has error
	? <ErrorPage/>
	: data // has data
		? <Data data={data}/>
		: timedOut // loading
			? <Loading/>
			: null
```
This `useTimedOut` hook is available in [misc-hooks](https://www.npmjs.com/package/misc-hooks) package.
- For now, both `data` and `Error`'s types are defined. We will improve the type definition in the future.

### Component Usage
```tsx
import {Fetch} from 'clean-fetch'

return <Fetch fetch={() => fetchJson('/user/info')}>
	{(data, reload) => <Data data={data} reload={reload}/>}
</Fetch>
```
`Fetch` is a React component which takes 3 props:
- (Optional) `Fallback`: a component that takes an optional `error` prop and a `reload` prop which is a function that reloads the data.
If `error` is `undefined`, it means the data is loading.
By default, it is a component which returns `null`.
- `fetch`: a function that returns a promise which resolves to the data.
- `children`: a function that takes 2 arguments: the data and a `reload` function and returns a ReactNode.
