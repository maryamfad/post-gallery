import React from "react";
import { useQuery } from "@apollo/client/react/hooks/useQuery.js";
import { useMutation } from "@apollo/client/react/hooks/useMutation";

import { Link } from "react-router-dom";
import { useState } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { BiUpvote, BiSolidUpvote } from "react-icons/bi";
import { ADD_REACTION } from "../graphql/mutations/addReaction";
import { REMOVE_REACTION } from "../graphql/mutations/removeReaction";
import { GET_POSTS } from "../graphql/queries/getPosts";
import {
	Media,
	Post,
	GetPostsVariables,
	GetPostsResponse,
	PostGalleryProps,
} from "../types";

const isImage = (media: Media) => media.__typename === "Image";

const PostGallery: React.FC<PostGalleryProps> = ({
	postsInitialData,
	postLikes,
	postUpvotes,
	setPostLikes,
	setPostUpvotes,
}) => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [seeMoreClicked, setSeeMoreClicked] = useState(false);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	let reaction = "";
	const variables: GetPostsVariables = {
		filterBy: [],
		limit: 9,
		orderByString: "publishedAt",
		reverse: true,
		after: null,
	};

	const { data, loading, error, fetchMore } = useQuery<
		GetPostsResponse,
		GetPostsVariables
	>(GET_POSTS, {
		skip: !!postsInitialData,
		fetchPolicy: "no-cache",

		variables: variables,
		onCompleted: (data) => {
			setPosts((prevPosts) => [...prevPosts, ...data.posts.nodes]);
		},
		onError: (error) => {
			console.error("Get posts error:", error);
		},
	});

	const endCursor =
		postsInitialData?.posts.pageInfo.endCursor ||
		data?.posts.pageInfo.endCursor ||
		[];

	const [addReaction] = useMutation(ADD_REACTION, {
		onCompleted: (data) => {
			console.log("Add reaction completed:", data);
		},
		onError: (error) => {
			console.error("Add reaction error:", error);
		},
	});

	const [removeReaction] = useMutation(REMOVE_REACTION, {
		onCompleted: (data) => {
			console.log("Remove reaction completed:", data);
		},
		onError: (error) => {
			console.error("Remove reaction error:", error);
		},
	});

	const handleLikeClick = async (postId: string) => {
		try {
			if (
				(reaction === "like" && postLikes[postId]) ||
				(reaction === "upvote" && postUpvotes[postId])
			) {
				await removeReaction({
					variables: {
						postId,
						overrideSingleChoiceReactions: true,
						reaction: reaction,
					},
				});
				if (reaction === "like") {
					setPostLikes((prevLikes) => ({
						...prevLikes,
						[postId]: false,
					}));
				} else {
					setPostUpvotes((prevUpvotes) => ({
						...prevUpvotes,
						[postId]: false,
					}));
				}
			} else {
				await addReaction({
					variables: {
						postId,
						input: {
							reaction: reaction,
							overrideSingleChoiceReactions: true,
						},
					},
				});
				if (reaction === "like") {
					setPostLikes((prevLikes) => ({
						...prevLikes,
						[postId]: true,
					}));
				} else {
					setPostUpvotes((prevUpvotes) => ({
						...prevUpvotes,
						[postId]: true,
					}));
				}
			}
		} catch (error) {
			console.error("Error reacting post:", error);
		}
	};

	if (error) return <p>Error loading posts.</p>;
	if (loading && !postsInitialData) return <p>Loading...</p>;

	const handleLoadMore = () => {
		setSeeMoreClicked(true);
		setIsFetchingMore(true);
		fetchMore({
			variables: {
				after: endCursor,
			},
			updateQuery: (previousResult, { fetchMoreResult }) => {
				if (!fetchMoreResult) return previousResult;
				const newPosts = [
					...previousResult.posts.nodes,
					...fetchMoreResult.posts.nodes,
				];

				setPosts(newPosts);
				setIsFetchingMore(false);
				return {
					posts: {
						...fetchMoreResult.posts,
						nodes: newPosts,
					},
				};
			},
		});
	};
	console.log("posts", posts);
	console.log("initial posts", postsInitialData);

	return (
		<div className="post-gallery container mx-auto p-3 grid sm:grid-cols-1 md:grid-cols-3 gap-8 ">
			{(postsInitialData.posts.nodes || posts || []).length === 0 ? (
				<p className="text-center text-gray-500">No posts available</p>
			) : (
				(!seeMoreClicked
					? postsInitialData.posts.nodes || posts
					: posts
				).map((post, index) => (
					<div
						key={index}
						className="block max-w-lg rounded-lg bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-white border border-gray-300 gap-18 shadow-md hover:shadow-lg transition-shadow"
					>
						<div className="relative overflow-hidden bg-cover bg-no-repeat">
							{post.fields.filter(
								(field) => field.key === "cover_image"
							).length ? (
								post.fields
									.filter(
										(field) => field.key === "cover_image"
									)
									.flatMap((field) =>
										field.relationEntities?.medias?.filter(
											isImage
										)
									)
									.map((image, index) => (
										<img
											key={index}
											className="rounded-t-lg"
											src={image.url}
											alt={image.name}
										/>
									))
							) : (
								<img
									className="rounded-t-lg"
									src="https://tribe-s3-production.imgix.net/ymDqIfItLVeI3QjOsfib7?fit=max&w=1000&auto=compress,format"
									alt="Cover Image"
								/>
							)}
						</div>
						<div className="p-6 lg:h-[250px]">
							<Link
								to={`/post/${post.id}`}
								className="block hover:shadow-xl transition-shadow duration-200"
							>
								<h5 className="mb-2 text-xl font-medium leading-tight text-customBlue text-left">
									{post.title}
								</h5>
							</Link>
							<p className="font-semibold text-left">
								{post.description.split("\n")[0]}
							</p>
							<p className="text-base text-left">
								{post.description.split("\n")[1]}
							</p>
						</div>
						<div className="p-6">
							{post.allowedReactions.includes("like") ? (
								<button
									onClick={() => {
										reaction = "like";
										handleLikeClick(post.id);
									}}
									className="flex items-center space-x-2 ml-1 px-4 py-2 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 focus:outline-none"
								>
									{postLikes[post.id] ? (
										<FaHeart
											className="text-red-500 transition duration-300 ease-in-out"
											size={24}
										/>
									) : (
										<FaRegHeart
											className="text-gray-500 transition duration-300 ease-in-out hover:text-red-500"
											size={24}
										/>
									)}
								</button>
							) : (
								<div></div>
							)}
							{post.allowedReactions.includes("upvote") ? (
								<button
									onClick={() => {
										reaction = "upvote";
										handleLikeClick(post.id);
									}}
									className="flex items-center ml-1 space-x-2 px-4 py-2 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 focus:outline-none"
								>
									{postUpvotes[post.id] ? (
										<BiSolidUpvote
											className="text-gray-500 transition duration-300 ease-in-out "
											size={24}
										/>
									) : (
										<BiUpvote
											className="text-gray-500 transition duration-300 ease-in-out"
											size={24}
										/>
									)}
								</button>
							) : (
								<div></div>
							)}
						</div>
					</div>
				))
			)}

			<div className="empty"></div>
			{isFetchingMore ? (
				<p>Fetching more...</p>
			) : (
				<div>
					{postsInitialData.posts.pageInfo.hasNextPage ||
					data?.posts.pageInfo.hasNextPage ? (
						<div>
							<button
								onClick={handleLoadMore}
								className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
							>
								Load More
							</button>
						</div>
					) : (
						<div></div>
					)}
				</div>
			)}
		</div>
	);
};

export default PostGallery;
