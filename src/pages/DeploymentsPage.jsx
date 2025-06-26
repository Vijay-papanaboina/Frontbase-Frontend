import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const DeploymentsPage = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllDeployments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all repos first
        const reposRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/github/repos`,
          { credentials: "include" }
        );
        if (!reposRes.ok) throw new Error("Failed to fetch repos");
        const reposData = await reposRes.json();
        const repos = reposData.repos || [];
        // Fetch deployments for each repo
        const allDeployments = [];
        for (const repo of repos) {
          const depRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/github/repos/${
              repo.id
            }/deployments`,
            { credentials: "include" }
          );
          if (depRes.ok) {
            const depData = await depRes.json();
            if (Array.isArray(depData)) {
              allDeployments.push(...depData.map((d) => ({ ...d, repo })));
            } else if (depData) {
              allDeployments.push({ ...depData, repo });
            }
          }
        }
        // Sort by startedAt/started_at desc
        allDeployments.sort(
          (a, b) =>
            new Date(b.startedAt || b.started_at) -
            new Date(a.startedAt || a.started_at)
        );
        setDeployments(allDeployments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllDeployments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <Card className="bg-gray-900/80 border-gray-800 shadow-2xl backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-white flex items-center">
            <Rocket className="mr-3 h-6 w-6 text-green-400" />
            Deployments
          </CardTitle>
          <CardDescription className="text-gray-400">
            All recent deployments across your repositories.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-white">Repository</TableHead>
                <TableHead className="text-white">Workflow Run ID</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Conclusion</TableHead>
                <TableHead className="text-white">Started At</TableHead>
                <TableHead className="text-white">Completed At</TableHead>
                <TableHead className="text-white">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-gray-800">
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded bg-gray-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12 rounded bg-gray-800" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow className="border-gray-800">
                  <TableCell colSpan={7} className="text-center text-red-400">
                    {error}
                  </TableCell>
                </TableRow>
              ) : deployments.length === 0 ? (
                <TableRow className="border-gray-800">
                  <TableCell colSpan={7} className="text-center text-gray-400">
                    No deployments found.
                  </TableCell>
                </TableRow>
              ) : (
                deployments.map((dep) => (
                  <TableRow
                    key={dep.workflowRunId || dep.id}
                    className="border-gray-800"
                  >
                    <TableCell className="text-white">
                      {dep.repo?.name || dep.repo?.full_name || "-"}
                    </TableCell>
                    <TableCell className="text-white">
                      {dep.workflowRunId || dep.id}
                    </TableCell>
                    <TableCell className="text-white">{dep.status}</TableCell>
                    <TableCell className="text-white">
                      {dep.conclusion}
                    </TableCell>
                    <TableCell className="text-white">
                      {dep.startedAt || dep.started_at}
                    </TableCell>
                    <TableCell className="text-white">
                      {dep.completedAt || dep.completed_at}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/deployments/${dep.workflowRunId || dep.id}`}
                        className="text-blue-400 underline cursor-pointer"
                      >
                        View
                      </Link>
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

export default DeploymentsPage;
