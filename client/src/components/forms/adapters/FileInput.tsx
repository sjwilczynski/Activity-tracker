import { FileUp, Info } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { Button } from "../../ui/button";

type FileInputProps = {
  value: File | null;
  onChange: (value: File | null) => void;
  onBlur: () => void;
  error?: string;
};

/**
 * Makes File object properties enumerable so TanStack Form's deep equality check
 * can detect changes between different files.
 * Workaround for: https://github.com/TanStack/form/issues/1932
 */
function makeFileEnumerable(file: File): File {
  Object.defineProperties(file, {
    name: { value: file.name, enumerable: true },
    size: { value: file.size, enumerable: true },
    type: { value: file.type, enumerable: true },
  });
  return file;
}

export const FileInput = ({
  value,
  onChange,
  onBlur,
  error,
}: FileInputProps) => {
  const onFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const files = input.files;
      if (files && files[0]) {
        onChange(makeFileEnumerable(files[0]));
        input.value = "";
      }
    },
    [onChange]
  );

  const fileName = value?.name;

  return (
    <div className="space-y-3">
      <input
        key={fileName ?? "empty"}
        className="hidden"
        id="contained-button-file"
        type="file"
        onChange={onFileInputChange}
        onBlur={onBlur}
      />
      <div className="flex items-center gap-2">
        <label htmlFor="contained-button-file" className="flex-1">
          <Button variant="outline" className="w-full cursor-pointer" asChild>
            <span>
              <FileUp className="size-4 mr-2" />
              Select file
            </span>
          </Button>
        </label>
        <Button variant="ghost" size="icon" className="size-9" asChild>
          <a
            href="https://github.com/sjwilczynski/Activity-tracker/blob/main/example-activities-file.json"
            target="_blank"
            rel="noopener noreferrer"
            title="View example file format"
          >
            <Info className="size-4 text-muted-foreground" />
          </a>
        </Button>
      </div>
      {fileName && (
        <p className="text-sm text-center text-muted-foreground">{fileName}</p>
      )}
      {error && <p className="text-sm text-center text-destructive">{error}</p>}
    </div>
  );
};
