import { useQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";

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
}
interface PageInfo {
	endCursor: string | null;
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
}
const variables: GetPostsVariables = {
	filterBy: [],
	limit: 9,
	// postTypeIds: ["vBnK4XeS3ZrSmZj"],
	orderByString: "publishedAt",
	reverse: true,
	// spaceIds: ["WxXxnvPGyAu9"],
};
const GET_POSTS = gql`
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
				slug
				language
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
								width
								height
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
		}
	}
`;
const isImage = (media: Media): media is Image => {
	return media.__typename === "Image";
};

const PostGallery: React.FC = () => {
	const { data, loading, error } = useQuery<
		GetPostsResponse,
		GetPostsVariables
	>(GET_POSTS, {
		variables: variables,
	});

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error loading posts.</p>;

	return (
		<div className="post-gallery container mx-auto p-3 grid sm:grid-cols-1 md:grid-cols-3 gap-8 ">
			{data?.posts.nodes.length === 0 && (
				<p className="text-center text-gray-500">No posts available</p>
			)}
			{data?.posts.nodes.map((post) => (
				<div className="block max-w-lg rounded-lg bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-white border border-gray-300 gap-18">
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
								.map((image) => (
									<img
										className="rounded-t-lg"
										src={image.url}
										alt=""
									/>
								))
						) : (
							<img
								className="rounded-t-lg"
								src="https://tribe-s3-production.imgix.net/ymDqIfItLVeI3QjOsfib7?fit=max&w=1000&auto=compress,format"
								alt=""
								width={"1000px"}
								height={"563px"}
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
					{post.hasMoreContent && <div>See more</div>}
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
			<div className="pagination w-full text-center mt-8 block flex items-center justify-center"></div>
		</div>
	);
};

export default PostGallery;
