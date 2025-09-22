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
import ReactIcon from "@/assets/react.svg";
import EnvVarsDialog from "@/components/EnvVarsDialog";
import RedeployDialog from "@/components/RedeployDialog";

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

const DeploymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [redeployDialogOpen, setRedeployDialogOpen] = useState(false);
  const [redeployFramework, setRedeployFramework] = useState(
    FRAMEWORKS[0].value
  );
  const [redeployBuildCommand, setRedeployBuildCommand] = useState(
    FRAMEWORKS[0].buildCommand
  );
  const [redeployOutputFolder, setRedeployOutputFolder] = useState(
    FRAMEWORKS[0].outputFolder
  );

  useEffect(() => {
    const fetchDeployment = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all deployments in a single API call
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/github/deployments`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch deployments");
        const deployments = await response.json();

        // Find the specific deployment by ID
        const found = deployments.find(
          (d) => String(d.workflowRunId || d.id) === id
        );
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

  const handleRedeploy = async (fw, buildCmd, outFolder, commitSha) => {
    if (!deployment?.repository?.id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/workflows/${
          deployment.repository.id
        }/redeploy`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            framework: fw,
            buildCommand: buildCmd,
            outputFolder: outFolder,
            commitSha,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to trigger redeploy");
      alert("Redeployment triggered!");
      // Refresh deployment status
      // await fetchDeployment();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setRedeployDialogOpen(false);
    }
  };

  const openEnvModal = () => {
    if (!deployment?.repository) return;
    setEnvModalOpen(true);
  };

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
          {/* Action buttons */}
          {deployment && (
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setRedeployDialogOpen(true)}
                disabled={loading}
                className="bg-primary text-primary-foreground"
              >
                Redeploy
              </Button>
              <Button
                onClick={openEnvModal}
                className="bg-secondary text-secondary-foreground"
              >
                Environment Variables
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Mobile: Stacked card layout */}
          <div className="block sm:hidden">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="mb-4 p-4 rounded-lg border bg-background shadow"
                >
                  <Skeleton className="h-5 w-24 mb-2 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-40 mb-2 rounded bg-muted-foreground/30" />
                </div>
              ))
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : deployment ? (
              <div className="mb-4 p-4 rounded-lg border bg-background shadow">
                {Object.entries(deployment)
                  .slice(0, -1)
                  .map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <span className="font-semibold capitalize">{key}:</span>{" "}
                      <span className="text-foreground">
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
          {/* Desktop/tablet: Table layout */}
          <div className="hidden sm:block">
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
          </div>
        </CardContent>
      </Card>
      <EnvVarsDialog
        open={envModalOpen}
        onOpenChange={setEnvModalOpen}
        repoId={deployment?.repository?.id}
      />
      <RedeployDialog
        open={redeployDialogOpen}
        onOpenChange={setRedeployDialogOpen}
        frameworks={FRAMEWORKS}
        framework={redeployFramework}
        setFramework={setRedeployFramework}
        buildCommand={redeployBuildCommand}
        setBuildCommand={setRedeployBuildCommand}
        outputFolder={redeployOutputFolder}
        setOutputFolder={setRedeployOutputFolder}
        repoId={deployment?.repository?.id}
        onRedeploy={(commitSha) =>
          handleRedeploy(
            redeployFramework,
            redeployBuildCommand,
            redeployOutputFolder,
            commitSha
          )
        }
        loading={loading}
      />
    </div>
  );
};

export default DeploymentDetails;
