import React from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { ADD_REACTION } from "../graphql/mutations/addReaction";
import { REMOVE_REACTION } from "../graphql/mutations/removeReaction";

interface GetPostsResponse {
	posts: {
		totalCount: number;
		nodes: Post[];
		pageInfo: PageInfo;
	};
}
interface PostMappingField {
	key: string;
	type: string;
	value: string;
}

interface RelationEntities {
	medias: Media[];
	members: [];
	posts: [];
	spaces: string[];
	tags: string[];
}
interface Field {
	key: string;
	value: string;
	relationEntities: RelationEntities;
}
interface Edge {
	cursor: string;
}
interface PostReactionDetail {
	count: number;
	reacted: boolean;
	reaction: string;
}
interface Post {
	createdAt: string;
	id: string;
	slug: string;
	mappingFields: [PostMappingField];
	fields: Field[];
	language: string;
	shortContent: string;
	hasMoreContent: boolean;
	title: string;
	description: string;
	status: string;
	subscribersCount: number;
	edges: Edge[];
	primaryReactionType: ReactionType;
	reactions: [PostReactionDetail];
	allowedReactions: [string];
}
interface PageInfo {
	endCursor: string;
	hasNextPage: boolean;
}

type Image = {
	__typename: "Image";
	name: string;
	url: string;
	height: number;
	width: number;
};
type File = {
	__typename: "File";
	id: string;
	url: string;
};
type Emoji = {
	__typename: "Emoji";
	id: string;
	text: string;
};

type Media = Image | File | Emoji;

interface GetPostsVariables {
	filterBy?: string[] | null;
	limit: number;
	postTypeIds?: string[];
	orderByString?: string | null;
	reverse?: boolean | null;
	spaceIds?: string[];
	after?: string | null;
}
enum ReactionType {
	EMOJI_BASE,
	LIKE_BASE,
	VOTE_BASE,
}

export const GET_POSTS = gql`
	query GetPosts(
		$after: String
		$before: String
		$excludePins: Boolean
		$filterBy: [PostListFilterByInput!]
		$limit: Int!
		$offset: Int
		$orderBy: PostListOrderByEnum
		$orderByString: String
		$postTypeIds: [String!]
		$reverse: Boolean
		$spaceIds: [ID!]
	) {
		posts(
			after: $after
			before: $before
			excludePins: $excludePins
			filterBy: $filterBy
			limit: $limit
			offset: $offset
			orderBy: $orderBy
			orderByString: $orderByString
			postTypeIds: $postTypeIds
			reverse: $reverse
			spaceIds: $spaceIds
		) {
			totalCount
			pageInfo {
				endCursor
				hasNextPage
			}
			nodes {
				id
				mappingFields {
					key
					type
					value
				}
				fields {
					key
					value
					relationEntities {
						medias {
							... on File {
								url
							}
							... on Image {
								url
								name
							}
							... on Emoji {
								id
								text
							}
						}
					}
				}
				primaryReactionType
				reactions {
					reacted
					reaction
				}
				allowedReactions
				shortContent
				hasMoreContent
				title
				description
				status
				createdAt
				subscribersCount
			}
			edges {
				cursor
			}
		}
	}
`;
const isImage = (media: Media) => media.__typename === "Image";

type PostLikesState = Record<string, boolean>;

const PostGallery: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [postLikes, setPostLikes] = useState<PostLikesState>({});

	console.log("postLiles", postLikes);

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
			if (postLikes[postId]) {
				const { data } = await removeReaction({
					variables: {
						postId,
						overrideSingleChoiceReactions: true,
						reaction: "upvote",
					},
				});
				console.log("remove reaction data: " + JSON.stringify(data));

				setPostLikes((prevLikes) => ({
					...prevLikes,
					[postId]: false,
				}));
			} else {
				await addReaction({
					variables: {
						postId,
						input: {
							reaction: "upvote",
							overrideSingleChoiceReactions: true,
						},
					},
				});
				setPostLikes((prevLikes) => ({
					...prevLikes,
					[postId]: true,
				}));
			}
		} catch (error) {
			console.error("Error liking post:", error);
		}
	};

	const variables: GetPostsVariables = {
		filterBy: [],
		limit: 9,
		// postTypeIds: ["vBnK4XeS3ZrSmZj"],
		orderByString: "publishedAt",
		reverse: true,
		// spaceIds: ["WxXxnvPGyAu9"],
		after: null,
	};
	const { data, loading, error, fetchMore } = useQuery<
		GetPostsResponse,
		GetPostsVariables
	>(GET_POSTS, {
		variables: variables,
		onCompleted: (data) => {
			setPosts((prevPosts) => [...prevPosts, ...data.posts.nodes]);
		},
	});
	useEffect(() => {
		if (data?.posts) {
			const likesState = data?.posts.nodes.reduce((acc, post) => {
				const hasReaction =
					post.reactions.filter(
						(reaction) => reaction.reaction === "upvote"
					).length > 0;
				console.log("hasReaction: " + hasReaction, post);

				return {
					...acc,
					[post.id]: hasReaction,
				};
			}, {});

			setPostLikes(likesState);
		}
	}, [data]);
	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error loading posts.</p>;

	const handleLoadMore = () => {
		fetchMore({
			variables: {
				after: data?.posts.pageInfo.endCursor,
			},
			updateQuery: (previousResult, { fetchMoreResult }) => {
				if (!fetchMoreResult) return previousResult;
				const newPosts = [
					...previousResult.posts.nodes,
					...fetchMoreResult.posts.nodes,
				];

				setPosts(newPosts);

				return {
					posts: {
						...fetchMoreResult.posts,
						nodes: newPosts,
					},
				};
			},
		});
	};

	return (
		<div className="post-gallery container mx-auto p-3 grid sm:grid-cols-1 md:grid-cols-3 gap-8 ">
			{data?.posts.nodes.length === 0 && (
				<p className="text-center text-gray-500">No posts available</p>
			)}
			{posts?.map((post, index) => (
				<div
					key={index}
					className="block max-w-lg rounded-lg bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-white border border-gray-300 gap-18"
				>
					<div className="relative overflow-hidden bg-cover bg-no-repeat">
						{post.fields.filter(
							(field) => field.key === "cover_image"
						).length ? (
							post.fields
								.filter((field) => field.key === "cover_image")
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
					<div className="p-6">
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
						{/* <a
							type="button"
							className="pointer-events-auto me-5 inline-block cursor-pointer rounded text-base font-normal leading-normal text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 focus:outline-none focus:ring-0 active:text-primary-700 dark:text-primary-400"
						>
							like
						</a> */}
						<button
							onClick={() => handleLikeClick(post.id)}
							className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 focus:outline-none"
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
					</div>
				</div>
			))}

			<div></div>

			{data?.posts.pageInfo.hasNextPage && (
				<button
					onClick={handleLoadMore}
					className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
				>
					Load More
				</button>
			)}
		</div>
	);
};

export default PostGallery;
