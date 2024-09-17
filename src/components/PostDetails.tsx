import React, { useState, useEffect } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { BiUpvote, BiSolidUpvote } from "react-icons/bi";
import { ADD_REACTION } from "../graphql/mutations/addReaction";
import { REMOVE_REACTION } from "../graphql/mutations/removeReaction";

interface PostMappingField {
	key: string;
	type: string;
	value: string;
}
interface Field {
	key: string;
	value: string;
	relationEntities: RelationEntities;
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
interface PostReactionDetail {
	count: number;
	reacted: boolean;
	reaction: string;
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
	allowedReactions: [string];
	reactions: [PostReactionDetail];
}
interface GetAPostVariables {
	id: string;
}
interface GetAPostResponse {
	post: PostNode;
}
export const GET_A_POST = gql`
	query GetAPost($id: ID!) {
		post(id: $id) {
			id
			title
			shortContent
			createdAt
			reactions {
				count
				reaction
			}

			allowedReactions

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
		}
	}
`;
const PostDetails = () => {
	const { id } = useParams<{ id: string }>();
	const [hasLike, setHasLike] = useState(false);
	const [hasUpvote, setHasUpvote] = useState(false);

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

	const variables: GetAPostVariables = {
		id: id ?? "",
	};
	const { data, loading, error } = useQuery<
		GetAPostResponse,
		GetAPostVariables
	>(GET_A_POST, {
		variables: variables,
	});

	useEffect(() => {
		if (data?.post) {
			setHasLike(
				data.post.reactions.filter((r) => r.reaction === "like")
					.length > 0
			);
			setHasUpvote(
				data.post.reactions.filter((r) => r.reaction === "upvote")
					.length > 0
			);
		}
	}, [data]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error loading posts.</p>;
	let reaction: string = "";

	const isImage = (media: Media) => media.__typename === "Image";
	const coverImageUrl = data?.post.fields
		.filter((field) => field.key === "cover_image")
		.flatMap((field) => field.relationEntities?.medias?.filter(isImage))
		.map((image) => image.url)[0];

	const coverImageName = data?.post.fields
		.filter((field) => field.key === "cover_image")
		.flatMap((field) => field.relationEntities?.medias?.filter(isImage))
		.map((image) => image.name)[0];

	const title =
		data?.post.fields
			.filter((field) => field.key === "title")
			.map((field) => field.value.replace(/"/g, ""))[0] || null;

	const content =
		data?.post.fields
			.filter((field) => field.key === "content")
			.map((field) => field.value.replace(/"/g, ""))[0] || "";

	const hasLikeButton =
		(data?.post.allowedReactions.filter((r) => r === "like") ?? []).length >
		0;

	const hasUpvoteButton =
		(data?.post.allowedReactions.filter((r) => r === "upvote") ?? [])
			.length > 0;

	const handleLikeClick = async (postId: string | undefined) => {
		try {
			if (
				(reaction === "like" && hasLike) ||
				(reaction === "upvote" && hasUpvote)
			) {
				await removeReaction({
					variables: {
						postId,
						overrideSingleChoiceReactions: true,
						reaction: reaction,
					},
				});
				if (reaction === "like") {
					setHasLike(false);
				} else {
					setHasUpvote(false);
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
					setHasLike(true);
				} else {
					setHasUpvote(true);
				}
			}
		} catch (error) {
			console.error("Error reacting to the post:", error);
		}
	};

	return (
		<div className="block rounded-lg bg-white shadow-secondary-1  text-surface border border-customGray w-full max-w-4xl shadow-xl">
			<div className="relative overflow-hidden bg-cover bg-no-repeat w-full">
				{coverImageUrl ? (
					<img
						className="rounded-t-lg"
						src={coverImageUrl}
						alt={coverImageName}
					/>
				) : (
					<img
						className="rounded-t-lg"
						src="https://tribe-s3-production.imgix.net/ymDqIfItLVeI3QjOsfib7?fit=max&w=1000&auto=compress,format"
						alt="Cover Image"
					/>
				)}
			</div>
			<div className="p-6">
				{hasLikeButton && (
					<button
						onClick={() => {
							reaction = "like";
							handleLikeClick(id);
						}}
						className="flex items-center space-x-2 ml-1 px-4 py-2 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 focus:outline-none"
					>
						{hasLike ? (
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
				)}
				{hasUpvoteButton && (
					<button
						onClick={() => {
							reaction = "upvote";
							handleLikeClick(id);
						}}
						className="flex items-center ml-1 space-x-2 px-4 py-2 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 focus:outline-none"
					>
						{hasUpvote ? (
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
				)}
			</div>
			<div className="p-6">
				<h5 className="mb-4 mt-4 text-2xl font-medium leading-tight">
					{title}
				</h5>

				<div
					className="content text-left"
					dangerouslySetInnerHTML={{ __html: content }}
				/>

				<p className="text-base text-surface/75 dark:text-neutral-300">
					{data?.post?.createdAt ? (
						<small>
							Created at:{" "}
							{new Date(data.post.createdAt).toLocaleDateString(
								"en-CA"
							)}
						</small>
					) : (
						""
					)}
				</p>
			</div>
		</div>
	);
};
export default PostDetails;
