import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/callback?code=${code}`,
        {
            method: "GET",
            credentials: "include",
          }
        )
        .then(() => {
          navigate("/dashboard");
        })
        .catch(() => {
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Finalizing login...</p>
    </div>
  );
}

export default Callback;