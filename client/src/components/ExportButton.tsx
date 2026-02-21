import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

type Props = {
  disabled?: boolean;
  exportFile: () => Promise<string>;
  filename?: string;
};

export const ExportButton = ({
  disabled = false,
  exportFile,
  filename = "activity-tracker-export.json",
}: Props) => {
  const [isExporting, setIsExporting] = useState(false);
  const isDisabled = disabled || isExporting;

  const handleExport = async () => {
    if (isDisabled) return;
    setIsExporting(true);
    try {
      const jsonData = await exportFile();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(`Failed to export ${filename}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex-1 sm:flex-none"
      disabled={disabled}
      aria-disabled={isDisabled}
      onClick={handleExport}
    >
      <Download className="size-4 sm:mr-2" />
      <span className="hidden sm:inline">
        {isExporting ? "Exporting..." : "Export"}
      </span>
    </Button>
  );
};
