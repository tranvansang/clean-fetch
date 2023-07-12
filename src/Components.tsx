import type {Component, ReactNode} from 'react'
import {useFetch, useFetchAlways} from './hooks'

function EmptyFallback() {
	return null
}

interface FetchProps<T> {
	Fallback?: Component<{ // by default, a component returning null
		error?: Error // if error is undefined, it's loading
		reload(): Promise<T> | T
	}>
	fetch(): Promise<T> | T // fetch must not return undefined
	render(data: T, reload: () => Promise<T> | T): ReactNode
}

function Fetch_<T>(
	{
		Fallback = EmptyFallback,
		fetch,
		render,
		useHook,
	}: FetchProps<T> & {
		useHook: typeof useFetch | typeof useFetchAlways
	}
) {
	const {reload, data, error} = useHook(fetch)
	return data === undefined
		? <Fallback reload={reload} error={error}/>
		: render(data, reload)
}
export function Fetch<T>(props: FetchProps<T>) {
	return Fetch_<T>({...props, useHook: useFetch})
}

export function FetchAlways<T>(props: FetchProps<T>) {
	return Fetch_<T>({...props, useHook: useFetchAlways})
}
