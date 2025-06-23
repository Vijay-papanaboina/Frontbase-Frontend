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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const RepoStatus = ({ status }) => {
  if (status === "ready-to-deploy") {
    return (
      <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
        <CheckCircle className="mr-2 h-4 w-4" />
        Ready to Deploy
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

const Dashboard = () => {
  const { user } = useAuthStore();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingUp, setSettingUp] = useState({});

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
      // No alert needed, UI will update reactively
      await fetchRepos();
    } catch (err) {
      console.error(err);
      alert(`Failed to setup workflow: ${err.message}`);
    } finally {
      setSettingUp((prev) => ({ ...prev, [`${owner}/${repoName}`]: false }));
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
                [...Array(5)].map((_, i) => (
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
                      <RepoStatus
                        status={
                          repo.deployYmlInjected
                            ? "ready-to-deploy"
                            : "not-deployed"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {repo.deployYmlInjected ? (
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          Deploy
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() =>
                            handleSetupWorkflow(
                              repo.id,
                              repo.owner.login,
                              repo.name
                            )
                          }
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
    </div>
  );
};

export default Dashboard;
