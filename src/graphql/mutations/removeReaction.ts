import { gql } from "@apollo/client";

export const REMOVE_REACTION = gql`
	mutation RemoveReaction($reaction: String!, $postId: ID!) {
		removeReaction(reaction: $reaction, postId: $postId) {
			status
		}
	}
`;