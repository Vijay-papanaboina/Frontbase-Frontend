import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  GitBranchPlus,
  Rocket,
  Wand2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactIcon from "@/assets/react.svg";
import EnvDialog from "@/components/EnvDialog";

const RepoStatus = ({ status }) => {
  if (status === "deployed") {
    return (
      <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
        <CheckCircle className="mr-2 h-4 w-4" />
        Deployed
      </Badge>
    );
  }
  if (status === "deploying") {
    return (
      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Deploying...
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
      <AlertTriangle className="mr-2 h-4 w-4" />
      Setup required
    </Badge>
  );
};

// Framework options and their defaults
const FRAMEWORKS = [
  {
    label: "React (CRA)",
    value: "react",
    buildCommand: "npm run build",
    outputFolder: "build",
  },
  {
    label: "Vite",
    value: "vite",
    buildCommand: "npm run build",
    outputFolder: "dist",
  },
  {
    label: "Vue (CLI)",
    value: "vue",
    buildCommand: "npm run build",
    outputFolder: "dist",
  },
  {
    label: "Angular",
    value: "angular",
    buildCommand: "ng build --configuration production",
    outputFolder: "dist",
  },
  {
    label: "Next.js",
    value: "nextjs",
    buildCommand: "npm run build && npm run export",
    outputFolder: "out",
  },
  {
    label: "Svelte",
    value: "svelte",
    buildCommand: "npm run build",
    outputFolder: "public",
  },
  { label: "Custom", value: "custom", buildCommand: "", outputFolder: "" },
];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingUp, setSettingUp] = useState({});
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [envVars, setEnvVars] = useState([{ key: "", value: "" }]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [framework, setFramework] = useState(FRAMEWORKS[0].value);
  const [buildCommand, setBuildCommand] = useState(FRAMEWORKS[0].buildCommand);
  const [outputFolder, setOutputFolder] = useState(FRAMEWORKS[0].outputFolder);
  const [deployments, setDeployments] = useState([]);
  const [deploymentsLoading, setDeploymentsLoading] = useState(false);
  const [deploymentsError, setDeploymentsError] = useState(null);
  const navigate = useNavigate();

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/repos`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      const data = await response.json();
      setRepos(data.repos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    const fetchDeployments = async () => {
      if (!repos.length) return;
      setDeploymentsLoading(true);
      setDeploymentsError(null);
      try {
        const repo = repos[0];
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/github/repos/${
            repo.id
          }/deployments`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch deployments");
        const data = await response.json();
        setDeployments(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        setDeploymentsError(err.message);
      } finally {
        setDeploymentsLoading(false);
      }
    };
    fetchDeployments();
  }, [repos]);

  const handleSetupWorkflow = async (repoId, owner, repoName) => {
    setSettingUp((prev) => ({ ...prev, [`${owner}/${repoName}`]: true }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/repos/${repoId}/setup`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoName: repoName,
            ownerLogin: owner,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to setup workflow");
      }
      await fetchRepos();
    } catch (err) {
      console.error(err);
      alert(`Failed to setup workflow: ${err.message}`);
    } finally {
      setSettingUp((prev) => ({ ...prev, [`${owner}/${repoName}`]: false }));
    }
  };

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

  const handleEnvVarChange = (idx, field, value) => {
    setEnvVars((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const addEnvVar = () => {
    setEnvVars((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeEnvVar = (idx) => {
    setEnvVars((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFrameworkChange = (value) => {
    setFramework(value);
    const fw = FRAMEWORKS.find((f) => f.value === value);
    setBuildCommand(fw?.buildCommand || "");
    setOutputFolder(fw?.outputFolder || "");
  };

  const handleDeployWithEnv = async () => {
    if (!selectedRepo) return;
    setSettingUp((prev) => ({
      ...prev,
      [`${selectedRepo.owner.login}/${selectedRepo.name}`]: true,
    }));
    try {
      const env = envVars.filter((e) => e.key.trim() !== "");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/repos/${
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
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to setup workflow");
      }
      // Start polling for deployment status
      const pollDeploymentStatus = async (repoId, onSuccess, onFailure) => {
        for (let i = 0; i < 40; i++) {
          // poll up to 200 seconds
          const res = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/github/repos/${repoId}/deployment-status`,
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
      };
      await pollDeploymentStatus(
        selectedRepo.id,
        async (deployment) => {
          await fetchRepos();
          closeEnvModal();
          // Redirect to deployment details page
          navigate(`/deployments/${deployment.workflowRunId || deployment.id}`);
        },
        (conclusion) => {
          alert(`Deployment failed: ${conclusion}`);
        }
      );
    } catch (err) {
      console.error(err);
      alert(`Failed to setup workflow: ${err.message}`);
    } finally {
      setSettingUp((prev) => ({
        ...prev,
        [`${selectedRepo.owner.login}/${selectedRepo.name}`]: false,
      }));
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
      )}{" "}
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
                <div
                  key={repo.id}
                  className="mb-4 p-4 rounded-lg border bg-background shadow"
                >
                  <div className="font-bold text-foreground mb-1">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center group"
                    >
                      {repo.full_name}
                      <ExternalLink className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Visibility:</span>{" "}
                    {repo.private ? "Private" : "Public"}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Status:</span>{" "}
                    <RepoStatus status={repo.deployStatus} />
                  </div>
                  <div className="mt-2">
                    {repo.deployStatus === "deployed" ? (
                      <Button
                        size="sm"
                        className="bg-green-700 text-foreground w-full"
                        disabled
                      >
                        <Rocket className="mr-2 h-4 w-4" />
                        Deployed
                      </Button>
                    ) : repo.deployStatus === "deploying" ? (
                      <Button
                        size="sm"
                        className="bg-yellow-500 text-foreground w-full"
                        disabled
                      >
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Deploying...
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/80 text-primary-foreground w-full"
                        onClick={() => openEnvModal(repo)}
                        disabled={settingUp[`${repo.owner.login}/${repo.name}`]}
                      >
                        {settingUp[`${repo.owner.login}/${repo.name}`] ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        {settingUp[`${repo.owner.login}/${repo.name}`]
                          ? "Setting up..."
                          : "Setup Workflow"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Desktop/tablet: Table layout */}
          <div className="w-full overflow-x-auto sm:rounded-lg hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-background/50">
                  <TableHead className="text-foreground min-w-[120px]">
                    Name
                  </TableHead>
                  <TableHead className="text-foreground min-w-[80px] hidden sm:table-cell">
                    Visibility
                  </TableHead>
                  <TableHead className="text-foreground min-w-[100px]">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-foreground min-w-[120px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow
                      key={i}
                      className="border-border h-15 text-[15px]"
                    >
                      <TableCell className="min-w-[120px]">
                        <Skeleton className="h-6 w-100 rounded-md bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell className="min-w-[80px] hidden sm:table-cell">
                        <Skeleton className="h-6 w-16 rounded-full bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <Skeleton className="h-6 w-32 rounded-full bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <Skeleton className="h-8 w-32 ml-auto rounded-md bg-muted-foreground/30" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : repos.length === 0 ? (
                  <TableRow className="border-border h-15 text-[15px]">
                    <TableCell
                      colSpan={4}
                      className="h-48 text-center text-muted-foreground"
                    >
                      No repositories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  repos.map((repo) => (
                    <TableRow
                      key={repo.id}
                      className="border-border hover:bg-background/50 transition-colors h-15 text-[15px]"
                    >
                      <TableCell className="font-medium text-foreground min-w-[120px]">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center group"
                        >
                          {repo.full_name}
                          <ExternalLink className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      </TableCell>
                      <TableCell className="min-w-[80px] hidden sm:table-cell">
                        <Badge
                          variant={repo.private ? "secondary" : "outline"}
                          className="border-border bg-background text-muted-foreground"
                        >
                          {repo.private ? "Private" : "Public"}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <RepoStatus status={repo.deployStatus} />
                      </TableCell>
                      <TableCell className="text-right min-w-[120px]">
                        {repo.deployStatus === "deployed" ? (
                          <Button
                            size="sm"
                            className="bg-green-700 text-foreground"
                            disabled
                          >
                            <Rocket className="mr-2 h-4 w-4" />
                            Deployed
                          </Button>
                        ) : repo.deployStatus === "deploying" ? (
                          <Button
                            size="sm"
                            className="bg-yellow-500 text-foreground"
                            disabled
                          >
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Deploying...
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/80 text-primary-foreground"
                            onClick={() => openEnvModal(repo)}
                            disabled={
                              settingUp[`${repo.owner.login}/${repo.name}`]
                            }
                          >
                            {settingUp[`${repo.owner.login}/${repo.name}`] ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            {settingUp[`${repo.owner.login}/${repo.name}`]
                              ? "Setting up..."
                              : "Setup Workflow"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <EnvDialog
        open={envModalOpen}
        onOpenChange={setEnvModalOpen}
        frameworks={FRAMEWORKS}
        reactIcon={ReactIcon}
        framework={framework}
        setFramework={setFramework}
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
      />
    </div>
  );
};

export default Dashboard;
