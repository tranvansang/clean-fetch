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
export async function fetchJson<T>(url, init): Promise<T> {
	const res = await fetch(url, init)
	if (!res.ok) return await errorHandler(res)
	else return await res.json() as T
}

export async function fetchText(url, init) {
	const res = await fetch(url, init)
	if (!res.ok) return await errorHandler(res)
	else return await res.text()
}
