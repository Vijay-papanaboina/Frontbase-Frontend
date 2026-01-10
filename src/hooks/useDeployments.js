import { useState, useEffect, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom hook for fetching deployment status
 * @param {string} repoId - Repository ID to fetch status for
 * @returns {Object} Deployment state and methods
 */
export function useDeploymentStatus(repoId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    if (!repoId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/github/deployments/${repoId}/status`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch deployment status");
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
}

/**
 * Poll deployment status until completion
 * @param {string} repoId - Repository ID
 * @param {Function} onSuccess - Called when deployment succeeds
 * @param {Function} onFailure - Called when deployment fails
 * @param {number} maxAttempts - Maximum poll attempts (default 40 = 200 seconds)
 */
export async function pollDeploymentStatus(
  repoId,
  onSuccess,
  onFailure,
  maxAttempts = 40
) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${BACKEND_URL}/api/github/deployments/${repoId}/status`,
      { credentials: "include" }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === "completed") {
        if (data.conclusion === "success") {
          onSuccess(data);
          return;
        } else {
          onFailure(data.conclusion);
          return;
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  onFailure("timeout");
}

export default useDeploymentStatus;
