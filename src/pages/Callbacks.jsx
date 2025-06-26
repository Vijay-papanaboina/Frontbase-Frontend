import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      axios
        .get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/auth/github/callback?code=${code}`,
          { withCredentials: true }
        )
        .then(() => {
          navigate("/dashboard");
        })
        .catch(() => {
          navigate("/");
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Finalizing login...</p>
    </div>
  );
}

export default Callback;
