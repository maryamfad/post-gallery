import { Routes, Route } from "react-router-dom";
import "./App.css";
import PostGallery from "../components/PostGallery";
import PostDetails from "../components/PostDetails";
import NotFound from "../components/NotFound";
import { AppProps } from "../components/types";

const App: React.FC<AppProps> = ({ posts }) => {
	return (
		<>
			<Routes>
				<Route
					path="/"
					element={<PostGallery postsInitialData={posts} />}
				/>
				<Route path="/post/:id" element={<PostDetails />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</>
	);
};

export default App;
