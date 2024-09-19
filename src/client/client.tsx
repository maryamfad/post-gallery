import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "../server/apolloClient";
import App from "./App";
import "../index.css";

const client = createApolloClient((window as any).__APOLLO_STATE__);
const initialPosts = (window as any).__INITIAL_DATA__;

hydrateRoot(
	document.getElementById("root")!,
	<ApolloProvider client={client}>
		<BrowserRouter>
			<React.StrictMode>
				<App posts={JSON.parse(JSON.stringify(initialPosts))} />
			</React.StrictMode>
		</BrowserRouter>
	</ApolloProvider>
);
