import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import PostGallery from "../src/components/PostGallery";
import { GET_POSTS } from "../src/components/PostGallery";
import { BrowserRouter as Router } from "react-router-dom";

const mockPostsData = {
	posts: {
		totalCount: 5,
		pageInfo: {
			endCursor: "cursor123",
			hasNextPage: true,
		},
		nodes: [
			{
				id: "1",
				title: "Test Post 1",
				fields: [
					{
						key: "cover_image",
						value: "",
						relationEntities: {
							medias: [
								{
									__typename: "Image",
									url: "https://example.com/image.jpg",
									name: "Cover Image",
								},
							],
						},
					},
				],
				shortContent: "This is a short content.",
				hasMoreContent: false,
				description: "This is a test description.\nExtra content.",
				status: "PUBLISHED",
				createdAt: "2024-09-10T00:00:00.000Z",
				subscribersCount: 10,
			},
		],
		edges: {
			cursor: "cursor123",
		},
	},
};
const fetchMoreMockPosts = {
	posts: {
		totalCount: 5,
		pageInfo: {
			endCursor: "cursor124",
			hasNextPage: true,
		},
		nodes: [
			{
				id: "2",
				title: "Test Post 2",
				fields: [
					{
						key: "cover_image",
						value: "",
						relationEntities: {
							medias: [
								{
									__typename: "Image",
									url: "https://example.com/image2.jpg",
									name: "Cover Image 2",
								},
							],
						},
					},
				],
				shortContent: "This is also a short content.",
				hasMoreContent: false,
				description: "This is also a test description.\nExtra content.",
				status: "PUBLISHED",
				createdAt: "2024-09-10T00:00:00.000Z",
				subscribersCount: 10,
			},
		],
		edges: {
			cursor: "cursor124",
		},
	},
};

const mocks = [
	{
		request: {
			query: GET_POSTS,
			variables: {
				filterBy: [],
				limit: 9,
				orderByString: "publishedAt",
				reverse: true,
				after: null,
			},
		},
		result: {
			data: mockPostsData,
		},
	// },
	// {
	// 	request: {
	// 		query: GET_POSTS,
	// 		variables: {
	// 			filterBy: [],
	// 			limit: 9,
	// 			orderByString: "publishedAt",
	// 			reverse: true,
	// 			after: "cursor123",
	// 		},
	// 	},
	// 	result: {
	// 		data: fetchMoreMockPosts,
	// 	},
	},
];

const mocks2 = [
	{
		request: {
			query: GET_POSTS,
			variables: {
				filterBy: [],
				limit: 9,
				orderByString: "publishedAt",
				reverse: true,
				after: null,
			},
		},
		result: {
			data: mockPostsData,
		},
	},
	{
		request: {
			query: GET_POSTS,
			variables: {
				filterBy: [],
				limit: 9,
				orderByString: "publishedAt",
				reverse: true,
				after: "cursor123",
			},
		},
		result: {
			data: fetchMoreMockPosts,
		},
	},
];

describe("PostGallery Component", () => {
	it("renders loading state initially", () => {
		render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<Router>
					<PostGallery />
				</Router>
			</MockedProvider>
		);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("renders posts correctly after loading", async () => {
		render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<Router>
					<PostGallery />
				</Router>
			</MockedProvider>
		);

		await waitFor(() => {
			expect(screen.getByText("Test Post 1")).toBeInTheDocument();
		});

		expect(screen.getByText("Test Post 1")).toBeInTheDocument();
		expect(
			screen.getByText("This is a test description.")
		).toBeInTheDocument();
		expect(screen.getByText("Extra content.")).toBeInTheDocument();

		const image = screen.getByAltText("Cover Image");
		expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
	});

	it("renders error message on error", async () => {
		const errorMocks = [
			{
				request: {
					query: GET_POSTS,
					variables: {
						filterBy: [],
						limit: 9,
						orderByString: "publishedAt",
						reverse: true,
					},
				},
				error: new Error("Error loading posts"),
			},
		];

		render(
			<MockedProvider mocks={errorMocks} addTypename={false}>
				<Router>
					<PostGallery />
				</Router>
			</MockedProvider>
		);

		await waitFor(() => {
			expect(
				screen.getByText("Error loading posts.")
			).toBeInTheDocument();
		});
	});

	it("loads more posts when 'Load More' button is clicked", async () => {
		render(
			<MockedProvider mocks={mocks2} addTypename={false}>
				<Router>
					<PostGallery />
				</Router>
			</MockedProvider>
		);

		await waitFor(() => {
			screen.debug();
			const loadMoreButton = screen.getByText("Load More");
			expect(loadMoreButton).toBeInTheDocument();
			fireEvent.click(loadMoreButton);
		});

		await waitFor(() => {
			expect(screen.getByText("Test Post 2")).toBeInTheDocument();
		});
	});
});
