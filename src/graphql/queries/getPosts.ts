import { gql } from "@apollo/client/core";
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
				positiveReactions
				allowedEmojis
			}
			edges {
				cursor
			}
		}
	}
`;