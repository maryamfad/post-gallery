import React from "react";
import { useQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import { useState } from "react";

interface GetPostsResponse {
	posts: {
		totalCount: number;
		nodes: PostNode[];
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
interface Edge{
	cursor: string;
}
interface PostNode {
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
				shortContent
				hasMoreContent
				title
				description
				status
				createdAt
				subscribersCount
			}
			edges{
				cursor
			}
		}
	}
`;
const isImage = (media: Media) => media.__typename === "Image";

const PostGallery: React.FC = () => {
	const [posts, setPosts] = useState<PostNode[]>([]);
	const variables: GetPostsVariables = {
		filterBy: [],
		limit: 1,
		// postTypeIds: ["vBnK4XeS3ZrSmZj"],
		orderByString: "publishedAt",
		reverse: true,
		// spaceIds: ["WxXxnvPGyAu9"],
		after:null
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

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error loading posts.</p>;
console.log("dataaa", data?.posts.nodes);
console.log("loadinggg", loading);
console.log("erorrrr", error);


	const handleLoadMore = () => {
		console.log("Load More button clicked");
		fetchMore({
			variables: {
				after: data?.posts.pageInfo.endCursor,
			},
			updateQuery: (previousResult, { fetchMoreResult }) => {
				console.log("updateQuery called");
				console.log("fetchMoreResult",fetchMoreResult);
				
				if (!fetchMoreResult) return previousResult;
				const newPosts = [
					...previousResult.posts.nodes,
					...fetchMoreResult.posts.nodes,
				];

				setPosts(newPosts);
				console.log("posts",{
					posts: {
						...fetchMoreResult.posts,
						nodes: newPosts,
					},
				});
				
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
						<a
							type="button"
							className="pointer-events-auto me-5 inline-block cursor-pointer rounded text-base font-normal leading-normal text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 focus:outline-none focus:ring-0 active:text-primary-700 dark:text-primary-400"
						>
							like
						</a>
						<a
							type="button"
							className="pointer-events-auto inline-block cursor-pointer rounded text-base font-normal leading-normal text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 focus:outline-none focus:ring-0 active:text-primary-700 dark:text-primary-400"
						>
							Share
						</a>
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
