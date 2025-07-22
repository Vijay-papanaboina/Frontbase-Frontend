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
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

const RedeployDialog = ({
  open,
  onOpenChange,
  frameworks,
  framework,
  setFramework,
  buildCommand,
  setBuildCommand,
  outputFolder,
  setOutputFolder,
  onRedeploy,
  loading,
  repoId,
}) => {
  const [commits, setCommits] = useState([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState("");
  const [commitError, setCommitError] = useState(null);

  const handleFrameworkChange = (value) => {
    setFramework(value);
    const fw = frameworks.find((f) => f.value === value);
    setBuildCommand(fw?.buildCommand || "");
    setOutputFolder(fw?.outputFolder || "");
  };

  useEffect(() => {
    if (open && repoId) {
      setCommitsLoading(true);
      setCommitError(null);
      fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/github/repositories/${repoId}/commits`,
        {
          credentials: "include",
        }
      )
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch commits");
          return res.json();
        })
        .then((data) => {
          setCommits(data);
          setSelectedCommit(data[0]?.sha || "");
        })
        .catch((err) => setCommitError(err.message))
        .finally(() => setCommitsLoading(false));
    }
  }, [open, repoId]);

  const handleRedeployClick = () => {
    onRedeploy(selectedCommit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-50 max-w-2xl p-8 bg-background border-border shadow-2xl"
        aria-describedby="redeploy-dialog-desc"
      >
        <span id="redeploy-dialog-desc" className="sr-only">
          Select framework, build command, and output folder for redeployment.
        </span>
        <DialogHeader>
          <DialogTitle>Redeploy: Build Settings</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Commit to Deploy
          </label>
          {commitsLoading ? (
            <div className="flex items-center text-muted-foreground">
              <RefreshCw className="animate-spin mr-2" />
              Loading commits...
            </div>
          ) : commitError ? (
            <div className="text-red-500 text-sm">{commitError}</div>
          ) : (
            <Select value={selectedCommit} onValueChange={setSelectedCommit}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Select commit" />
              </SelectTrigger>
              <SelectContent className="bg-background max-h-64 overflow-y-auto">
                {commits.map((commit) => (
                  <SelectItem
                    key={commit.sha}
                    value={commit.sha}
                    className="cursor-pointer flex flex-col items-start gap-1 hover:bg-muted"
                  >
                    <span className="font-mono text-xs">
                      {commit.sha.slice(0, 7)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {commit.commit?.message?.split("\n")[0]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Framework</label>
          <Select value={framework} onValueChange={handleFrameworkChange}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {frameworks.map((fw) => (
                <SelectItem
                  key={fw.value}
                  value={fw.value}
                  className="cursor-pointer flex items-center gap-2 hover:bg-muted"
                >
                  {fw.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">
              Build Command
            </label>
            <Input
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              placeholder="e.g. npm run build"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">
              Output Folder
            </label>
            <Input
              value={outputFolder}
              onChange={(e) => setOutputFolder(e.target.value)}
              placeholder="e.g. dist"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleRedeployClick}
            className="bg-primary text-primary-foreground hover:bg-primary/80 hover:cursor-pointer"
            disabled={
              loading || !buildCommand || !outputFolder || !selectedCommit
            }
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Redeploy
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground hover:cursor-pointer"
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RedeployDialog;
