import { ApolloClient, InMemoryCache } from "@apollo/client/core/core.cjs";
import { HttpLink } from "@apollo/client/link/http/http.cjs";
import fetch from "cross-fetch";

export const createApolloClient = (initialState = {}) => {
	type FetchOptions = RequestInit | undefined;

	const customFetch = (
		uri: RequestInfo | URL,
		options?: FetchOptions
	): Promise<Response> => {
		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(
				() => reject(new Error("Request timeout")),
				10000
			);

			fetch(uri, options)
				.then((response) => {
					clearTimeout(timeoutId);
					resolve(response);
				})
				.catch((err) => {
					clearTimeout(timeoutId);
					reject(err);
				});
		});
	};
	return new ApolloClient({
		ssrMode: typeof window === "undefined",
		link: new HttpLink({
			uri: "https://api.bettermode.com/",
			fetch: customFetch,
			headers: {
				Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`,
			},
		}),
		cache: new InMemoryCache().restore(initialState),
	});
};
