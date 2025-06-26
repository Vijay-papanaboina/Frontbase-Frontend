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
        // Fetch deployments for each repo in parallel
        const deploymentPromises = repos.map(async (repo) => {
          try {
            const depRes = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/github/repos/${
                repo.id
              }/deployments`,
              { credentials: "include" }
            );
            if (depRes.ok) {
              const depData = await depRes.json();
              if (Array.isArray(depData)) {
                return depData.map((d) => ({ ...d, repo }));
              } else if (depData) {
                return [{ ...depData, repo }];
              }
            }
            return [];
          } catch (err) {
            console.error(
              `Error fetching deployments for repo ${repo.id}:`,
              err
            );
            return [];
          }
        });
        const deploymentArrays = await Promise.all(deploymentPromises);
        const allDeployments = deploymentArrays.flat();
        // Sort by startedAt/started_at desc with null-safe handling
        allDeployments.sort((a, b) => {
          const dateA = new Date(a.startedAt || a.started_at || 0);
          const dateB = new Date(b.startedAt || b.started_at || 0);
          return dateB.getTime() - dateA.getTime();
        });
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
      <Card className="bg-background border-border shadow-2xl backdrop-blur-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground flex items-center">
            <Rocket className="mr-3 h-6 w-6 text-primary" />
            Deployments
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            All recent deployments across your repositories.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-background/50">
                <TableHead className="text-foreground">Repository</TableHead>
                <TableHead className="text-foreground">
                  Workflow Run ID
                </TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Conclusion</TableHead>
                <TableHead className="text-foreground">Started At</TableHead>
                <TableHead className="text-foreground">Completed At</TableHead>
                <TableHead className="text-foreground">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody >
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border h-15 text-[15px]">
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-full bg-skeleton-background" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-md bg-skeleton-background" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-md bg-skeleton-background" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-md bg-skeleton-background" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-md bg-skeleton-background" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-full bg-skeleton-background" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12 rounded-full bg-skeleton-background" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow className="border-border mb-2 h-15 text-[15px]">
                  <TableCell colSpan={7} className="text-center text-red-400">
                    {error}
                  </TableCell>
                </TableRow>
              ) : deployments.length === 0 ? (
                <TableRow className="border-border mb-2 h-15 text-[15px]">
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No deployments found.
                  </TableCell>
                </TableRow>
              ) : (
                deployments.map((dep) => (
                  <TableRow
                    key={dep.workflowRunId || dep.id}
                    className="border-border mb-2 h-15 text-[15px]"
                  >
                    <TableCell className="text-foreground">
                      {dep.repo?.name || dep.repo?.full_name || "-"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {dep.workflowRunId || dep.id}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {dep.status}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {dep.conclusion}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {dep.startedAt || dep.started_at}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {dep.completedAt || dep.completed_at}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/deployments/${dep.workflowRunId || dep.id}`}
                        className="text-primary underline cursor-pointer"
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
