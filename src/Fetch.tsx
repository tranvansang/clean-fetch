import type {ComponentType, ReactNode} from 'react'
import {useFetch} from './hooks.js'

function EmptyFallback() {
	return null
}

export default function Fetch<T>(
	{
		Fallback = EmptyFallback,
		fetch,
		children,
	}: {
	Fallback?: ComponentType<{ // by default, a component returning null
		error?: Error // if error is undefined, it's loading
		reload(): Promise<T>
	}>
	fetch(): Promise<T> // fetch must not return undefined
	children(data: T, reload: () => Promise<T>): ReactNode
}
) {
	const {reload, data, error} = useFetch(fetch)
	const F = Fallback as any
	return data === undefined
		? <F reload={reload} error={error}/>
		: children(data, reload)
}
Fetch.displayName = 'Fetch'
