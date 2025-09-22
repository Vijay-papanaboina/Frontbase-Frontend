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
        // Fetch all deployments in a single API call
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/github/deployments`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch deployments");
        const data = await response.json();
        setDeployments(data || []);
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
          {/* Mobile: Stacked card layout */}
          <div className="block sm:hidden">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="mb-4 p-4 rounded-lg border bg-background shadow"
                >
                  <Skeleton className="h-5 w-24 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-16 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-16 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-16 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-24 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-24 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-12 rounded bg-muted-foreground/30" />
                </div>
              ))
            ) : error ? (
              <div className="text-center text-red-400 py-8">{error}</div>
            ) : deployments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No deployments found.
              </div>
            ) : (
              deployments.map((dep) => (
                <div
                  key={dep.workflowRunId || dep.id}
                  className="mb-4 p-4 rounded-lg border bg-background shadow"
                >
                  <div className="font-bold text-foreground mb-1">
                    {dep.repository?.fullName ||
                      dep.repository?.name ||
                      dep.repo?.name ||
                      dep.repo?.full_name ||
                      "-"}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Workflow Run ID:</span>{" "}
                    {dep.workflowRunId || dep.id}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Status:</span> {dep.status}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Conclusion:</span>{" "}
                    {dep.conclusion}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Started At:</span>{" "}
                    {dep.startedAt || dep.started_at}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Completed At:</span>{" "}
                    {dep.completedAt || dep.completed_at}
                  </div>
                  <div className="mt-2">
                    <Link
                      to={`/deployments/${dep.workflowRunId || dep.id}`}
                      className="text-primary underline cursor-pointer"
                    >
                      View Details
                    </Link>
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
                  <TableHead className="text-foreground">Repository</TableHead>
                  <TableHead className="text-foreground">
                    Workflow Run ID
                  </TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Conclusion</TableHead>
                  <TableHead className="text-foreground">Started At</TableHead>
                  <TableHead className="text-foreground">
                    Completed At
                  </TableHead>
                  <TableHead className="text-foreground">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow
                      key={i}
                      className="border-border h-15 text-[15px]"
                    >
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-full bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-md bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-md bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-md bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-md bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-full bg-muted-foreground/30" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-12 rounded-full bg-muted-foreground/30" />
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
                        {dep.repository?.fullName ||
                          dep.repository?.name ||
                          dep.repo?.name ||
                          dep.repo?.full_name ||
                          "-"}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentsPage;
