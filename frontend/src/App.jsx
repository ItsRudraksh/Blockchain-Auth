import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Home from "./components/Home";
import useAxiosInterceptor from "./hooks/useAxiosInterceptor";
import useAuthCheck from "./hooks/useAuthCheck";
const App = () => {
  useAuthCheck(); // Check token on reload
  useAxiosInterceptor(); // Handle 401 responses
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default App;
