import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import PostGallery from "../components/PostGallery";
import PostDetails from "../components/PostDetails";
import NotFound from "../components/NotFound";
import { AppProps, PostReactionState } from "../types";
import LoginPage from "../components/Login";

const App: React.FC<AppProps> = ({ posts }) => {
	const [postLikes, setPostLikes] = useState<PostReactionState>({});
	const [postUpvotes, setPostUpvotes] = useState<PostReactionState>({});
	useEffect(() => {
		const likesState = Object.fromEntries(
			posts.posts.nodes.map((post) => {
				const hasLike = post.reactions.some(
					(reaction) => reaction.reaction === "like"
				);

				return [post.id, hasLike];
			})
		);

		const upvotesState = Object.fromEntries(
			posts.posts.nodes.map((post) => {
				const hasUpvote = post.reactions.some(
					(reaction) => reaction.reaction === "upvote"
				);

				return [post.id, hasUpvote];
			})
		);

		setPostLikes(likesState);
		setPostUpvotes(upvotesState);
	}, [posts]);

	return (
		<>
			<Routes>
				<Route
					path="/"
					element={
						<PostGallery
							postsInitialData={posts}
							postLikes={postLikes}
							postUpvotes={postUpvotes}
							setPostLikes={setPostLikes}
							setPostUpvotes={setPostUpvotes}
						/>
					}
				/>
				<Route
					path="/post/:id"
					element={
						<PostDetails
							postLikes={postLikes}
							postUpvotes={postUpvotes}
							setPostLikes={setPostLikes}
							setPostUpvotes={setPostUpvotes}
						/>
					}
				/>
				<Route path="/login" element={<LoginPage />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</>
	);
};

export default App;
