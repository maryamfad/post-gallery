import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import PostDetails from "../src/components/PostDetails";
import { GET_A_POST } from "../src/components/PostDetails";
import { BrowserRouter as Router } from "react-router-dom";
import { useParams } from "react-router-dom";

//mock the useParams hook to return a valid id
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useParams: jest.fn(),
}));

(useParams as jest.Mock).mockReturnValue({ id: "1" });

const mocks = [
	{
		request: {
			query: GET_A_POST,
			variables: { id: "1" },
		},
		result: {
			data: {
				post: {
					id: "1",
					title: "Test Post",
					createdAt: "2024-09-10T00:00:00.000Z",
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
						{
							key:"title",
							value:"Test Post"
						}
					],
					hasMoreContent: false,
					description:
						"This is a test description.\nExtra content.",
					status: "PUBLISHED",
					subscribersCount: 10,
				},
			},
		},
	},
];

describe("PostDetails Component", () => {
	it("renders loading state initially", () => {
		render(
			<MockedProvider mocks={[]} addTypename={false}>
				<Router>
					<PostDetails />
				</Router>
			</MockedProvider>
		);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("renders error message on error", async () => {
		const errorMocks = [
			{
				request: {
					query: GET_A_POST,
					variables: { id: "1" },
				},
				error: new Error("Error loading post"),
			},
		];

		render(
			<MockedProvider mocks={errorMocks} addTypename={false}>
				<Router>
					<PostDetails />
				</Router>
			</MockedProvider>
		);

		await waitFor(() => {
			expect(
				screen.getByText("Error loading posts.")
			).toBeInTheDocument();
		});
	});

	it("renders post details correctly", async () => {
		render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<Router>
					<PostDetails />
				</Router>
			</MockedProvider>
		);

		await waitFor(() => {
			expect(screen.getByText("Test Post")).toBeInTheDocument();

			

			expect(
				screen.getByText("Created at: 2024-09-09")
			).toBeInTheDocument();
		});
	});

	it("renders cover image correctly", async () => {
		const coverImageMock = {
			request: {
				query: GET_A_POST,
				variables: { id: "1" },
			},
			result: {
				data: {
					post: {
						id: "1",
						title: "Test Post",
						createdAt: "2024-09-10T00:00:00.000Z",
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
					},
				},
			},
		};

		render(
			<MockedProvider mocks={[coverImageMock]} addTypename={true}>
				<Router>
					<PostDetails />
				</Router>
			</MockedProvider>
		);

		await waitFor(() => {
			const image = screen.getByAltText("Cover Image");
			expect(image).toHaveAttribute(
				"src",
				"https://example.com/image.jpg"
			);
		});
	});
});
