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
        { credentials: "include" },
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
 * Watch deployment status using SSE with polling fallback
 * @param {string} repoId - Repository ID
 * @param {Function} onUpdate - Called on each status update
 * @param {Function} onComplete - Called when deployment succeeds
 * @param {Function} onFailure - Called when deployment fails
 */
export function watchDeploymentStatus(repoId, onUpdate, onComplete, onFailure) {
  let eventSource = null;
  let pollInterval = null;
  let isSSEActive = false;

  // Try SSE first
  const startSSE = () => {
    const sseUrl = `${BACKEND_URL}/api/github/deployments/${repoId}/stream`;
    console.log("📡 Attempting SSE connection:", sseUrl);

    eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onopen = () => {
      console.log("✅ SSE connection established");
      isSSEActive = true;
      // Stop polling if it was started
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Received SSE event:", data);

        if (data.status === "connected") return; // Ignore initial connection message

        // Call update callback
        onUpdate(data);

        // Handle completion
        if (data.status === "deployed") {
          onComplete(data);
          cleanup();
        } else if (data.status === "failed") {
          onFailure(data.error || "Deployment failed");
          cleanup();
        }
      } catch (err) {
        console.error("❌ Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("❌ SSE connection error:", error);

      // If SSE was never successfully opened, fall back to polling
      if (!isSSEActive) {
        console.log("⏩ Falling back to polling (SSE failed to connect)");
        cleanup();
        startPolling();
      }
    };
  };

  // Fallback polling
  const startPolling = () => {
    console.log("🔄 Starting polling fallback (3s interval)");

    const poll = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/github/deployments/${repoId}/status`,
          { credentials: "include" },
        );

        if (res.ok) {
          const data = await res.json();

          // Map GitHub Actions status to our SSE format
          const status =
            data.status === "completed"
              ? data.conclusion === "success"
                ? "deployed"
                : "failed"
              : "processing";

          const eventData = {
            status,
            data: { message: `Deployment ${status}` },
            timestamp: Date.now(),
          };

          onUpdate(eventData);

          if (status === "deployed") {
            onComplete(eventData);
            cleanup();
          } else if (status === "failed") {
            onFailure(data.conclusion);
            cleanup();
          }
        }
      } catch (err) {
        console.error("❌ Polling error:", err);
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    pollInterval = setInterval(poll, 3000);
  };

  // Cleanup function
  const cleanup = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  // Start with SSE
  startSSE();

  // Return cleanup function
  return cleanup;
}

export default useDeploymentStatus;
