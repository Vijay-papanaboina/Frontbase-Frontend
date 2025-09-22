import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

const EnvDialog = ({
  open,
  onOpenChange,
  frameworks = [],
  reactIcon,
  framework,
  setFramework,
  buildCommand,
  setBuildCommand,
  outputFolder,
  setOutputFolder,
  envVars,
  setEnvVars,
  handleDeployWithEnv,
  closeEnvModal,
  loading,
  repoId,
}) => {
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [savingIdx, setSavingIdx] = useState(null);

  // Handle framework change
  useEffect(() => {
    if (framework && frameworks.length > 0) {
      const selectedFramework = frameworks.find((fw) => fw.value === framework);
      if (selectedFramework) {
        setBuildCommand(selectedFramework.buildCommand);
        setOutputFolder(selectedFramework.outputFolder);
      }
    }
  }, [framework, frameworks, setBuildCommand, setOutputFolder]);

  // Fetch envs from backend when dialog opens
  useEffect(() => {
    if (open && repoId) {
      setFetching(true);
      (async () => {
        try {
          const res = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/environment/variables/${repoId}`,
            { credentials: "include" }
          );
          let envs = {};
          if (res.ok) {
            envs = await res.json();
          }
          setEnvVars(
            Object.entries(envs).map(([key, value]) => ({
              key,
              value,
              dirty: false,
              saved: true,
            })) || [{ key: "", value: "", dirty: true, saved: false }]
          );
        } catch (err) {
          setEnvVars([{ key: "", value: "", dirty: true, saved: false }]);
        } finally {
          setFetching(false);
        }
      })();
    }
    // eslint-disable-next-line
  }, [open, repoId]);

  const handleEnvVarChange = (idx, field, value) => {
    setError(null);
    setEnvVars((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]: value,
              dirty: true,
              saved: false,
            }
          : item
      )
    );
  };

  const handleSaveEnvVar = async (idx) => {
    const env = envVars[idx];
    if (!env.key) return;
    setError(null);
    setSavingIdx(idx);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/environment/variables/${repoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ key: env.key, value: env.value }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add/update env var");
      }
      // Mark as saved and not dirty
      setEnvVars((prev) =>
        prev.map((item, i) =>
          i === idx ? { ...item, dirty: false, saved: true } : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingIdx(null);
    }
  };

  const handleDeleteEnvVar = async (idx) => {
    const env = envVars[idx];
    if (!env.key) {
      setEnvVars((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setError(null);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/environment/variables/${repoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ key: env.key }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete env var");
      }
      setEnvVars((prev) => prev.filter((_, i) => i !== idx));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddEnvVar = () => {
    setError(null);
    setEnvVars((prev) => [
      ...prev,
      { key: "", value: "", dirty: true, saved: false },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-50 max-w-2xl p-8 bg-background border-border shadow-2xl"
        aria-describedby="env-dialog-desc"
      >
        <span id="env-dialog-desc" className="sr-only">
          Add, edit, or delete environment variables for this repository.
        </span>
        <DialogHeader>
          <DialogTitle>Setup Deployment Workflow</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        {/* Framework Selection */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Framework
            </label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a framework">
                  {framework &&
                    frameworks.find((fw) => fw.value === framework) && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {frameworks.find((fw) => fw.value === framework).icon}
                        </span>
                        <span>
                          {
                            frameworks.find((fw) => fw.value === framework)
                              .label
                          }
                        </span>
                      </div>
                    )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((fw) => (
                  <SelectItem key={fw.value} value={fw.value}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{fw.icon}</span>
                      <span>{fw.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Build Command
              </label>
              <Input
                value={buildCommand}
                onChange={(e) => setBuildCommand(e.target.value)}
                placeholder="npm run build"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Output Folder
              </label>
              <Input
                value={outputFolder}
                onChange={(e) => setOutputFolder(e.target.value)}
                placeholder="dist"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <h3 className="text-lg font-medium text-foreground mb-3">
            Environment Variables
          </h3>
        </div>
        {fetching ? (
          <div className="flex items-center justify-center min-h-[100px] text-muted-foreground">
            <RefreshCw className="animate-spin mr-2" /> Loading environment
            variables...
          </div>
        ) : (
          envVars.map((env, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <Input
                placeholder="Key"
                value={env.key}
                onChange={(e) => handleEnvVarChange(idx, "key", e.target.value)}
                disabled={fetching}
              />
              <Input
                placeholder="Value"
                value={env.value}
                onChange={(e) =>
                  handleEnvVarChange(idx, "value", e.target.value)
                }
                disabled={fetching}
              />
              {/* Only show Save if dirty */}
              {env.dirty && (
                <Button
                  variant="outline"
                  onClick={() => handleSaveEnvVar(idx)}
                  className="hover:bg-primary/80 hover:cursor-pointer text-foreground"
                  disabled={loading || !env.key || savingIdx === idx}
                >
                  {savingIdx === idx ? (
                    <span className="flex items-center">
                      <RefreshCw className="animate-spin mr-2" />
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => handleDeleteEnvVar(idx)}
                className="hover:bg-destructive hover:cursor-pointer text-foreground"
                disabled={loading || fetching}
              >
                <Trash2 />
              </Button>
            </div>
          ))
        )}
        <Button
          variant="outline"
          onClick={handleAddEnvVar}
          className="mb-4 cursor-pointer hover:bg-primary/80"
          disabled={loading}
        >
          <Plus className="mr-2" />
          Add Variable
        </Button>
        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={closeEnvModal}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground hover:cursor-pointer"
            disabled={loading}
          >
            Close
          </Button>
          <Button
            onClick={handleDeployWithEnv}
            disabled={loading || !buildCommand || !outputFolder}
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              "Deploy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnvDialog;
