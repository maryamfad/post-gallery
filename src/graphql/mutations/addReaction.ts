import { gql } from "@apollo/client";

export const ADD_REACTION = gql`
	mutation addReaction($input: AddReactionInput!, $postId: ID!) {
		addReaction(input: $input, postId: $postId) {
			status
		}
	}
`;
