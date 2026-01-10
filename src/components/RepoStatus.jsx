import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

/**
 * Displays the deployment status of a repository
 * @param {Object} props
 * @param {string} props.status - One of "deployed", "deploying", or undefined
 */
export function RepoStatus({ status }) {
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
}

export default RepoStatus;
