import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const useAuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        await axios.get("http://localhost:3000/verify-token", {
          withCredentials: true,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          // Token is expired or invalid
          navigate("/auth");
        }
      }
    };

    checkToken();
  }, [navigate]);
};

export default useAuthCheck;
