import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, Rocket, Wand2 } from "lucide-react";
import RepoStatus from "./RepoStatus";

/**
 * Mobile-friendly card view for a single repository
 * @param {Object} props
 * @param {Object} props.repo - Repository data
 * @param {boolean} props.isSettingUp - Whether workflow setup is in progress
 * @param {Function} props.onSetup - Called when setup button is clicked
 */
export function RepoCard({ repo, isSettingUp, onSetup }) {
  const repoKey = `${repo.owner.login}/${repo.name}`;

  return (
    <div className="mb-4 p-4 rounded-lg border bg-background shadow">
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
            onClick={() => onSetup(repo)}
            disabled={isSettingUp}
          >
            {isSettingUp ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isSettingUp ? "Setting up..." : "Setup Workflow"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default RepoCard;
