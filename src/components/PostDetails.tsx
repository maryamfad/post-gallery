import React from "react";
import { useQuery, gql } from "@apollo/client";
import { useParams } from "react-router-dom";

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

	const variables: GetAPostVariables = {
		id: id ?? "",
	};
	const { data, loading, error } = useQuery<
		GetAPostResponse,
		GetAPostVariables
	>(GET_A_POST, {
		variables: variables,
	});

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error loading posts.</p>;

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
							Created at: {new Date(data.post.createdAt).toLocaleDateString('en-CA')}
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
