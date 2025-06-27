import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DeploymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeployment = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try all repos to find the deployment by id
        const reposRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/github/repos`,
          { credentials: "include" }
        );
        if (!reposRes.ok) throw new Error("Failed to fetch repos");
        const reposData = await reposRes.json();
        const repos = reposData.repos || [];
        let found = null;
        for (const repo of repos) {
          const depRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/github/repos/${
              repo.id
            }/deployments`,
            { credentials: "include" }
          );
          if (depRes.ok) {
            const depData = await depRes.json();
            let arr = [];
            if (Array.isArray(depData)) {
              arr = depData;
            } else if (depData) {
              arr = [depData];
            }
            found = arr.find((d) => String(d.workflowRunId || d.id) === id);
            if (found) {
              found.repo = repo;
              break;
            }
          }
        }
        if (!found) throw new Error("Deployment not found");
        setDeployment(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDeployment();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <Card className="bg-background border-border shadow-2xl backdrop-blur-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Rocket className="text-primary" /> Deployment Details
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Details for deployment ID: <span className="font-mono">{id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Table>
              <TableBody>
                {[...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold text-foreground w-1/3 capitalize">
                      <Skeleton className="h-5 w-24 rounded bg-muted-foreground/30" />
                    </TableCell>
                    <TableCell className="text-foreground">
                      <Skeleton className="h-5 w-40 rounded bg-muted-foreground/30" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : deployment ? (
            <Table>
              <TableBody>
                {Object.entries(deployment)
                  .slice(0, -1)
                  .map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-semibold text-foreground w-1/3 capitalize">
                        {key}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value)
                          : String(value)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentDetails;
