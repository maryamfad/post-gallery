import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import PostGallery from "./components/PostGallery";
import PostDetails from "./components/PostDetails";
import NotFound from "./components/NotFound";

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<PostGallery />} />
					<Route path="/page/:pageNumber" element={<PostGallery />} />
					<Route path="/post/:id" element={<PostDetails />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Router>
		</>
	);
}

export default App;
