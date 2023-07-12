# Clean Fetch

## Simple, Unopinionated, Just Working - React Data Fetching Library

## Installation

```bash
yarn add clean-fetch
```

## Usage
This library is client side only, it does not support server side rendering.

### Hook Usage
```tsx
import {useFetch, useFetchAlways} from 'clean-fetch'
```

- Argument: Both functions take only one argument, a function that returns data or a promise which resolves to the data.
- Return: Both functions return `{data, error, reload}` with:
	- If `data` and `error` are both `undefined`, it means the data is loading or not yet fetched (initial render).
	- `reload`: a function that takes no argument, reloads the data and returns what the function passed to the hook returns.

- `useFetch`: only fetches data in the first return. If you want to refetch the data, you need to manually call `reload()`.
```typescript
const {data, error, reload} = useFetch(() => fetchData(params))
// when params changes, you need to manually call reload()
useEffect(() => void reload(), [params])
```

- `useFetchAlways`: always fetches data when the component is rendered.
To use this hook, you need to memorize the function passed to the hook, otherwise it will be called on every render.
```typescript
const {data, error, reload} = useFetch(useCallback(() => fetchData(params), [params]))
```

#### Note
- `useHook<T>()` and `useFetchAlways<T>()` have a generic type `T` which is the type of the data returned by the function passed to the hook.
- When calling `reload()`, `error` and `data` are immediately set to `undefined` (via `setState`) and the data is refetched.
- If you want to keep the last data while refetching, for example, to keep the last page of a paginated list until the new page is fetched, you can create a custom hook that retains the last data while fetching the new data.
```typescript
// only update when value is not undefined
export const useKeep = <T>(value: T): T => {
	const ref = useRef(value)
	if (value !== undefined) ref.current = value
	return value ?? ref.current
}
```
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

### Component Usage
```tsx
import {Fetch, FetchAlways} from 'clean-fetch'
```
Both two exported components take 3 props:
- (Optional) `Fallback`: a component that takes an optional `error` prop and a `reload` prop which is a function that reloads the data.
If `error` is undefined, it means the data is loading.
By default, it is a component which returns `null`.
- `fetch`: a function that returns data or a promise which resolves to the data.
- `render`: a function that takes 2 arguments: the data and a `reload` function and returns a ReactNode.

The difference between `Fetch` and `FetchAlways` is that they use `useFetch` and `useFetchAlways`, respectively.

### Fetch Utilities
We provide 2 wrappers of browser fetch API: `fetchJson` and `fetchText`.
```typescript
import {fetchJson, fetchText, setFetchErrorHandler} from 'clean-fetch'
```

- `fetchJson` and `fetchText` takes the same arguments as browser fetch API.
The former returns a promise which resolves to the JSON data, the latter returns a promise which resolves to the text.
If the response is not ok, the promise will be rejected with an Error object whose `message` is interpreted as below:
  - If the response is JSON and the JSON object has a truthy `message` property, the `message` property will be used as the error message.
  - Otherwise, the response status text will be used as the error message.
The error handler can be set via `setFetchErrorHandler`, a function that takes a function that takes the response object and should throw an Error object.
