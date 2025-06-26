import { useEffect, useState } from "react";
import useAuthStore from "@/lib/store";
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
  Plus,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import ReactIcon from "@/assets/react.svg";

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
      await fetchRepos();
      closeEnvModal();
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
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-white">
          Failed to load repositories
        </h3>
        <p className="mt-2 text-sm text-gray-400">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white"
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400">
            {user?.user_name || user?.github_handle}
          </span>
        </h1>
        <p className="text-gray-400">
          Manage your projects and deployments from this dashboard.
        </p>
      </div>

      <Card className="bg-gray-900/80 border-gray-800 shadow-2xl backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-white flex items-center">
            <GitBranchPlus className="mr-3 h-6 w-6 text-blue-400" />
            Your Repositories
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select a repository to set up the deployment workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Visibility</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <TableRow key={i} className="border-gray-800">
                    <TableCell>
                      <Skeleton className="h-5 w-3/4 rounded-md bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-32 rounded-full bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32 ml-auto rounded-md bg-gray-800" />
                    </TableCell>
                  </TableRow>
                ))
              ) : repos.length === 0 ? (
                <TableRow className="border-gray-800">
                  <TableCell
                    colSpan={4}
                    className="h-48 text-center text-gray-400"
                  >
                    No repositories found.
                  </TableCell>
                </TableRow>
              ) : (
                repos.map((repo) => (
                  <TableRow
                    key={repo.id}
                    className="border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="font-medium text-white">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center group"
                      >
                        {repo.full_name}
                        <ExternalLink className="ml-2 h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={repo.private ? "secondary" : "outline"}
                        className="border-gray-700 bg-gray-800 text-gray-300"
                      >
                        {repo.private ? "Private" : "Public"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RepoStatus status={repo.deployStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      {repo.deployStatus === "deployed" ? (
                        <Button
                          size="sm"
                          className="bg-green-700 text-white"
                          disabled
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          Deployed
                        </Button>
                      ) : repo.deployStatus === "deploying" ? (
                        <Button
                          size="sm"
                          className="bg-yellow-500 text-white"
                          disabled
                        >
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Deploying...
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
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
        </CardContent>
      </Card>

      <Dialog open={envModalOpen} onOpenChange={setEnvModalOpen}>
        <DialogContent
          className="z-50 max-w-2xl p-8"
          style={{ backgroundColor: "rgb(222, 214, 214)" }}
        >
          <DialogHeader>
            <DialogTitle>
              Set Environment Variables & Build Settings
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Framework</label>
            <Select value={framework} onValueChange={handleFrameworkChange}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "rgb(222, 214, 214)" }}>
                {FRAMEWORKS.map((fw) => (
                  <SelectItem
                    key={fw.value}
                    value={fw.value}
                    className="cursor-pointer flex items-center gap-2 hover:bg-gray-200"
                  >
                    {fw.value === "react" && (
                      <img src={ReactIcon} alt="React" className="w-5 h-5" />
                    )}
                    {fw.value === "vite" && <span className="text-lg">⚡</span>}
                    {fw.value === "vue" && <span className="text-lg">🟩</span>}
                    {fw.value === "angular" && (
                      <span className="text-lg">🅰️</span>
                    )}
                    {fw.value === "nextjs" && (
                      <span className="text-lg">⏭️</span>
                    )}
                    {fw.value === "svelte" && (
                      <span className="text-lg">🟠</span>
                    )}
                    {fw.value === "custom" && (
                      <span className="text-lg">🔧</span>
                    )}
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
              />
            </div>
          </div>
          {envVars.map((env, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <Input
                placeholder="Key"
                value={env.key}
                onChange={(e) => handleEnvVarChange(idx, "key", e.target.value)}
              />
              <Input
                placeholder="Value"
                value={env.value}
                onChange={(e) =>
                  handleEnvVarChange(idx, "value", e.target.value)
                }
              />
              <Button
                variant="ghost"
                onClick={() => removeEnvVar(idx)}
                className="hover:bg-red-500 hover:cursor-pointer text-white"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addEnvVar}
            className="mb-4 cursor-pointer"
          >
            <Plus className="mr-2" />
            Add Variable
          </Button>
          <DialogFooter>
            <Button
              onClick={handleDeployWithEnv}
              className="bg-green-600 text-white cursor-pointer"
            >
              Deploy
            </Button>
            <Button
              variant="ghost"
              onClick={closeEnvModal}
              className="cursor-pointer bg-red-500 text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
