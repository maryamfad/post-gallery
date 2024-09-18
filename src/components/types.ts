export type GetPostsResponse = {
	posts: {
		totalCount: number;
		nodes: Post[];
		pageInfo: PageInfo;
	};
};
export type PostMappingField = {
	key: string;
	type: string;
	value: string;
};

export type RelationEntities = {
	medias: Media[];
	members: [];
	posts: [];
	spaces: string[];
	tags: string[];
};
export type Field = {
	key: string;
	value: string;
	relationEntities: RelationEntities;
};
export type Edge = {
	cursor: string;
};
export type PostReactionDetail = {
	count: number;
	reacted: boolean;
	reaction: string;
};
export type Post = {
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
	positiveReactions: [string];
	allowedEmojis: [string];
};
export type PageInfo = {
	endCursor: string;
	hasNextPage: boolean;
};

export type Image = {
	__typename: "Image";
	name: string;
	url: string;
	height: number;
	width: number;
};
export type File = {
	__typename: "File";
	id: string;
	url: string;
};
export type Emoji = {
	__typename: "Emoji";
	id: string;
	text: string;
};

export type Media = Image | File | Emoji;

export type GetPostsVariables = {
	filterBy?: string[] | null;
	limit: number;
	postTypeIds?: string[];
	orderByString?: string | null;
	reverse?: boolean | null;
	spaceIds?: string[];
	after?: string | null;
};
enum ReactionType {
	EMOJI_BASE,
	LIKE_BASE,
	VOTE_BASE,
}

export type GetAPostVariables = {
	id: string;
};
export type GetAPostResponse = {
	post: Post;
};
