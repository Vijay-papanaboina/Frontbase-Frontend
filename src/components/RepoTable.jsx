import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, RefreshCw, Rocket, Wand2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RepoStatus from "./RepoStatus";

/**
 * Desktop table view for repositories
 * @param {Object} props
 * @param {Array} props.repos - List of repositories
 * @param {boolean} props.loading - Whether data is loading
 * @param {Object} props.settingUp - Map of repo keys to loading state
 * @param {Function} props.onSetup - Called when setup button is clicked
 */
export function RepoTable({ repos, loading, settingUp, onSetup }) {
  return (
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
              <TableRow key={i} className="border-border h-15 text-[15px]">
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
            repos.map((repo) => {
              const repoKey = `${repo.owner.login}/${repo.name}`;
              const isSettingUp = settingUp[repoKey];

              return (
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default RepoTable;
