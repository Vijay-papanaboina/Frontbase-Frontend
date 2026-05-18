import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, GitBranchPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactIcon from "@/assets/react.svg";
import EnvDialog from "@/components/EnvDialog";
import RepoTable from "@/components/RepoTable";
import RepoCard from "@/components/RepoCard";
import { useRepos } from "@/hooks/useRepos";
import { watchDeploymentStatus } from "@/hooks/useDeployments";
import { FRAMEWORKS } from "@/config/frameworks";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { repos, loading, error, refetch: fetchRepos } = useRepos();
  const [settingUp, setSettingUp] = useState({});
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [envVars, setEnvVars] = useState([{ key: "", value: "" }]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [framework, setFramework] = useState(FRAMEWORKS[0].value);
  const [buildCommand, setBuildCommand] = useState(FRAMEWORKS[0].buildCommand);
  const [outputFolder, setOutputFolder] = useState(FRAMEWORKS[0].outputFolder);
  const navigate = useNavigate();

  const openEnvModal = (repo) => {
    setSelectedRepo(repo);
    setEnvVars([{ key: "", value: "" }]);
    setFramework(FRAMEWORKS[0].value);
    setBuildCommand(FRAMEWORKS[0].buildCommand);
    setOutputFolder(FRAMEWORKS[0].outputFolder);
    setEnvModalOpen(true);
  };

  const closeEnvModal = () => {
    setEnvModalOpen(false);
    setSelectedRepo(null);
  };

  const handleFrameworkChange = (value) => {
    setFramework(value);
    const fw = FRAMEWORKS.find((f) => f.value === value);
    setBuildCommand(fw?.buildCommand || "");
    setOutputFolder(fw?.outputFolder || "");
  };

  const handleDeployWithEnv = async () => {
    if (!selectedRepo) return;
    const repoKey = `${selectedRepo.owner.login}/${selectedRepo.name}`;

    setSettingUp((prev) => ({ ...prev, [repoKey]: true }));
    try {
      const env = envVars.filter((e) => e.key.trim() !== "");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/workflows/${
          selectedRepo.id
        }/setup`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoName: selectedRepo.name,
            ownerLogin: selectedRepo.owner.login,
            envVars: env,
            framework,
            buildCommand,
            outputFolder,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to setup workflow");
      }

      // Watch deployment status (SSE with polling fallback)
      const cleanup = watchDeploymentStatus(
        selectedRepo.id,
        (statusData) => {
          // Status update callback (optional logging)
          console.log("Deployment status update:", statusData);
        },
        async (completionData) => {
          // Success callback
          await fetchRepos();
          closeEnvModal();
          navigate(
            `/deployments/${completionData.workflowRunId || selectedRepo.id}`,
          );
          cleanup(); // Cleanup on success
          setSettingUp((prev) => ({ ...prev, [repoKey]: false })); // Set to false on success
        },
        (error) => {
          // Failure callback
          alert(`Deployment failed: ${error}`);
          setSettingUp((prev) => ({ ...prev, [repoKey]: false }));
          cleanup(); // Cleanup on failure
        },
      );
    } catch (err) {
      console.error(err);
      alert(`Failed to setup workflow: ${err.message}`);
      setSettingUp((prev) => ({ ...prev, [repoKey]: false })); // Ensure state is reset on initial setup error
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          Failed to load repositories
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-foreground"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col gap-8 p-4 sm:p-6 md:p-8 -m-8">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] -z-10"></div>
      {envModalOpen && (
        <div className="absolute inset-0 z-20 backdrop-blur-sm bg-popover/30" />
      )}

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400">
            {user?.user_name || user?.github_handle}
          </span>
        </h1>
        <p className="text-muted-foreground">
          Manage your projects and deployments from this dashboard.
        </p>
      </div>

      <Card className="bg-background border-border shadow-2xl">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground flex items-center">
            <GitBranchPlus className="mr-3 h-6 w-6 text-blue-400" />
            Your Repositories
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Select a repository to set up the deployment workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile: Stacked card layout */}
          <div className="block sm:hidden">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="mb-4 p-4 rounded-lg border bg-background shadow"
                >
                  <Skeleton className="h-6 w-32 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-20 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-24 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-8 w-32 rounded bg-muted-foreground/30" />
                </div>
              ))
            ) : repos.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No repositories found.
              </div>
            ) : (
              repos.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  isSettingUp={settingUp[`${repo.owner.login}/${repo.name}`]}
                  onSetup={openEnvModal}
                />
              ))
            )}
          </div>

          {/* Desktop: Table layout */}
          <RepoTable
            repos={repos}
            loading={loading}
            settingUp={settingUp}
            onSetup={openEnvModal}
          />
        </CardContent>
      </Card>

      <EnvDialog
        open={envModalOpen}
        onOpenChange={setEnvModalOpen}
        frameworks={FRAMEWORKS}
        reactIcon={ReactIcon}
        framework={framework}
        setFramework={handleFrameworkChange}
        buildCommand={buildCommand}
        setBuildCommand={setBuildCommand}
        outputFolder={outputFolder}
        setOutputFolder={setOutputFolder}
        envVars={envVars}
        setEnvVars={setEnvVars}
        handleDeployWithEnv={handleDeployWithEnv}
        closeEnvModal={closeEnvModal}
        loading={
          settingUp[
            selectedRepo
              ? `${selectedRepo.owner.login}/${selectedRepo.name}`
              : ""
          ]
        }
        repoId={selectedRepo?.id}
      />
    </div>
  );
};

export default Dashboard;
