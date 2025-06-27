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
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const EnvDialog = ({
  open,
  onOpenChange,
  frameworks,
  reactIcon,
  framework,
  setFramework,
  buildCommand,
  setBuildCommand,
  outputFolder,
  setOutputFolder,
  envVars,
  setEnvVars,
  handleDeployWithEnv,
  closeEnvModal,
}) => {
  const handleFrameworkChange = (value) => {
    setFramework(value);
    const fw = frameworks.find((f) => f.value === value);
    setBuildCommand(fw?.buildCommand || "");
    setOutputFolder(fw?.outputFolder || "");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-50 max-w-2xl p-8 bg-background border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle>Set Environment Variables & Build Settings</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Framework</label>
          <Select value={framework} onValueChange={handleFrameworkChange}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {frameworks.map((fw) => (
                <SelectItem
                  key={fw.value}
                  value={fw.value}
                  className="cursor-pointer flex items-center gap-2 hover:bg-muted"
                >
                  {fw.value === "react" && (
                    <img src={reactIcon} alt="React" className="w-5 h-5" />
                  )}
                  {fw.value === "vite" && <span className="text-lg">⚡</span>}
                  {fw.value === "vue" && <span className="text-lg">🟩</span>}
                  {fw.value === "angular" && (
                    <span className="text-lg">🅰️</span>
                  )}
                  {fw.value === "nextjs" && <span className="text-lg">⏭️</span>}
                  {fw.value === "svelte" && <span className="text-lg">🟠</span>}
                  {fw.value === "custom" && <span className="text-lg">🔧</span>}
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
              onChange={(e) => handleEnvVarChange(idx, "value", e.target.value)}
            />
            <Button
              variant="ghost"
              onClick={() => removeEnvVar(idx)}
              className="hover:bg-destructive hover:cursor-pointer text-foreground"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addEnvVar}
          className="mb-4 cursor-pointer hover:bg-primary/80"
          
        >
          <Plus className="mr-2" />
          Add Variable
        </Button>
        <DialogFooter>
          <Button
            onClick={handleDeployWithEnv}
            className="bg-primary text-primary-foreground hover:bg-primary/80 hover:cursor-pointer"
          >
            Deploy
          </Button>
          <Button
            variant="ghost"
            onClick={closeEnvModal}
            className="text-destructive hover:bg-destructive hover:text-destructive hover:cursor-pointer"
          >
            Cancel
          </Button>{" "}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnvDialog;
