let errorHandler = async (res: Response) => {
	const text = await res.text()
	let json
	try {
		json = JSON.parse(text)
	} catch {}
	if (json?.error) throw new Error(json.error)
	throw new Error(text)
}
export function setFetchErrorHandler(handler: (res: Response) => any) {
	errorHandler = handler
}
export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
	const res = await fetch(input, init)
	if (!res.ok) return await errorHandler(res) as T
	else return await res.json() as T
}

export async function fetchText(input: RequestInfo | URL, init?: RequestInit) {
	const res = await fetch(input, init)
	if (!res.ok) return await errorHandler(res) as string
	else return await res.text()
}
