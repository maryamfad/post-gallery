import { gql } from "@apollo/client";
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