import express, { Request, Response } from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { ApolloProvider } from "@apollo/client/react/context/ApolloProvider";
import { createApolloClient } from "./apolloClient";
import App from "../client/App";
import "../client/App.css";
import { GET_POSTS } from "../graphql/queries/getPosts";
import {
	GetPostsResponse,
	GetPostsVariables,
	Params,
} from "../components/types";

const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3001;

async function createServer() {
	const app = express();
	let vite: any;
	if (!isProd) {
		const { createServer } = await import("vite");
		vite = await createServer({
			server: { middlewareMode: true },
			appType: "custom",
		});
		app.use(vite.middlewares);
	}

	app.use("*", async (req: Request<Params>, res: Response) => {
		try {
			const client = createApolloClient();

			const variables: GetPostsVariables = {
				filterBy: [],
				limit: 9,
				orderByString: "publishedAt",
				reverse: true,
				after: null,
			};
			const postsResponse = await client.query<
				GetPostsResponse,
				GetPostsVariables
			>({
				query: GET_POSTS,
				variables: variables,
			});
			const posts = postsResponse.data;

			const content = renderToString(
				<ApolloProvider client={client}>
					<StaticRouter location={req.originalUrl}>
						<App posts={posts} />
					</StaticRouter>
				</ApolloProvider>
			);

			const initialApolloState = client.extract();
			const html = await vite.transformIndexHtml(
				req.url,
				`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Post Gallery</title>
			<link href="/src/index.css" rel="stylesheet"> <!-- Tailwind CSS -->
          </head>
          <body>
            <div id="root">${content}</div>
			   <script>
              window.__APOLLO_STATE__ = ${JSON.stringify(
					initialApolloState
				).replace(/</g, "\\u003c")}
			  window.__INITIAL_DATA__ = ${JSON.stringify(posts).replace(/</g, "\\u003c")};
            </script>
            <script type="module" src="/src/client/client.tsx"></script>
          </body>
        </html>
      `
			);

			res.status(200).set({ "Content-Type": "text/html" }).end(html);
		} catch (error) {
			console.error(error);
			res.status(500).end("Internal Server Error");
		}
	});

	app.listen(PORT, () => {
		console.log(`Server is running on http://localhost:${PORT}`);
	});
}

createServer();
