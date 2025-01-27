/* import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // State to toggle between Login and Signup
  const navigate = useNavigate();

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://localhost:3000/login"
      : "http://localhost:3000/signup";

    try {
      const response = await axios.post(
        url,
        { username, password },
        { withCredentials: true } // Ensures cookies are sent
      );

      if (response.status === 200) {
        toast.success(`${isLogin ? "Login" : "Signup"} successful!`);
        navigate("/home"); // Redirect to the home page
      }
    } catch (err) {
      toast.error(
        isLogin
          ? `Invalid credentials or something went wrong: ${err}`
          : `User already exists or something went wrong: ${err}`
      );
    }
  };

  return (
    <div>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>

      <div>
        {isLogin ? (
          <p>
            {"Don't have an account? "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => setIsLogin(false)}
            >
              Create one
            </span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => setIsLogin(true)}
            >
              Login here
            </span>
          </p>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default Auth;
 */

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // State to toggle between Login and Signup
  const navigate = useNavigate();

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    const url = isLogin
      ? "http://localhost:3000/login"
      : "http://localhost:3000/signup";

    try {
      const response = await axios.post(
        url,
        { username, password },
        { withCredentials: true } // Ensures cookies are sent
      );

      if (response.status === 200) {
        toast.success(`${isLogin ? "Login" : "Signup"} successful!`);
        navigate("/home"); // Redirect to the home page
      }
    } catch (err) {
      const errorMessage = err.response?.data || "Something went wrong.";
      toast.error(
        isLogin
          ? `Login failed: ${errorMessage}`
          : `Signup failed: ${errorMessage}`
      );
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>

      <form onSubmit={handleSubmit} style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            padding: "10px",
            margin: "10px",
            width: "250px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "10px",
            margin: "10px",
            width: "250px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            marginTop: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <div>
        {isLogin ? (
          <p>
            {"Don't have an account? "}
            <span
              style={{
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => setIsLogin(false)}
            >
              Create one
            </span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span
              style={{
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => setIsLogin(true)}
            >
              Login here
            </span>
          </p>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default Auth;
