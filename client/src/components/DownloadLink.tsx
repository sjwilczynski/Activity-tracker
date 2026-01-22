import type { ReactNode, CSSProperties, MouseEvent } from "react";

interface DownloadLinkProps {
  filename: string;
  tagName?: string;
  style?: CSSProperties;
  label: ReactNode;
  exportFile: () => string;
}

export const DownloadLink = ({
  filename,
  tagName = "div",
  style,
  label,
  exportFile,
}: DownloadLinkProps) => {
  const handleDownload = (e: MouseEvent) => {
    e.preventDefault();

    try {
      const data = exportFile();
      const blob = new Blob([data], { type: "application/json" });
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
    }
  };

  const Component = tagName as keyof JSX.IntrinsicElements;

  return (
    <Component style={style} onClick={handleDownload}>
      {label}
    </Component>
  );
};
