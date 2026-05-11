import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function InputError({ error }: { error: string }) {
  const { t } = useTranslation("input-error");

  return (
    <span className="text-red-500 text-xs md:text-sm flex items-center gap-2">
      <AlertTriangle className="size-4" />
      {error ? t(`input-error.${error}`) : ""}
    </span>
  );
}