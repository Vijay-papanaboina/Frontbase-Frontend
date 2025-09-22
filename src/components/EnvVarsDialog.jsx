import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCw, Save } from "lucide-react";
import { useState, useEffect } from "react";

const EnvVarsDialog = ({ open, onOpenChange, repoId }) => {
  const [envVars, setEnvVars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch environment variables when dialog opens
  useEffect(() => {
    if (open && repoId) {
      fetchEnvVars();
    }
  }, [open, repoId]);

  const fetchEnvVars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/environment/variables/${repoId}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch environment variables");
      }

      const data = await response.json();
      const envArray = Object.entries(data).map(([key, value]) => ({
        id: key, // Use key as unique identifier
        key,
        value,
        isNew: false,
        isModified: false,
      }));

      setEnvVars(envArray);
    } catch (err) {
      setError(err.message);
      setEnvVars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnvVarChange = (index, field, value) => {
    setEnvVars((prev) =>
      prev.map((env, i) =>
        i === index
          ? {
              ...env,
              [field]: value,
              isModified:
                field === "value" ? value !== env.value : env.isModified,
              isNew: field === "key" && !env.isNew ? false : env.isNew,
            }
          : env
      )
    );
  };

  const handleSaveEnvVar = async (index) => {
    const env = envVars[index];
    if (!env.key.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/environment/variables/${repoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            key: env.key.trim(),
            value: env.value,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to save environment variable"
        );
      }

      // Mark as saved
      setEnvVars((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, isNew: false, isModified: false } : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEnvVar = async (index) => {
    const env = envVars[index];

    // If it's a new unsaved variable, just remove it
    if (env.isNew) {
      setEnvVars((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/environment/variables/${repoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            key: env.key,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete environment variable"
        );
      }

      // Remove from local state
      setEnvVars((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEnvVar = () => {
    setEnvVars((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`, // Unique ID for new items
        key: "",
        value: "",
        isNew: true,
        isModified: false,
      },
    ]);
  };

  const handleClose = () => {
    setEnvVars([]);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-50 max-w-2xl p-6 bg-background border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Environment Variables
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="text-red-500 mb-4 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[100px] text-muted-foreground">
              <RefreshCw className="animate-spin mr-2" />
              Loading environment variables...
            </div>
          ) : (
            <>
              {envVars.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No environment variables found. Add one to get started.
                </div>
              ) : (
                envVars.map((env, index) => (
                  <div key={env.id} className="flex gap-2 items-center">
                    <Input
                      placeholder="Variable name (e.g., API_KEY)"
                      value={env.key}
                      onChange={(e) =>
                        handleEnvVarChange(index, "key", e.target.value)
                      }
                      disabled={saving}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Variable value"
                      value={env.value}
                      onChange={(e) =>
                        handleEnvVarChange(index, "value", e.target.value)
                      }
                      disabled={saving}
                      className="flex-1"
                    />

                    {/* Save button - only show if modified or new */}
                    {(env.isModified || env.isNew) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveEnvVar(index)}
                        disabled={saving || !env.key.trim()}
                        className="flex items-center gap-1"
                      >
                        {saving ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEnvVar(index)}
                      disabled={saving}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}

              <Button
                variant="outline"
                onClick={handleAddEnvVar}
                disabled={saving}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Environment Variable
              </Button>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnvVarsDialog;
