import { gql } from "@apollo/client/core";

export const LOGIN_MUTATION = gql`
    mutation loginMutation($input: LoginNetworkWithPasswordInput!) {
        loginNetwork(input: $input) {
            accessToken
        }
    }
`;
