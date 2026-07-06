"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteReportAction } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";

/** Delete a saved report. Server action revalidates the list on completion. */
export function DeleteReportButton({
  id,
  label = "Delete",
  redirectTo,
}: {
  id: string;
  label?: string;
  /** Navigate here after deletion (used on the report detail page). */
  redirectTo?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onDelete = () => {
    startTransition(async () => {
      await deleteReportAction(id);
      toast.success("Report deleted.");
      if (redirectTo) router.push(redirectTo);
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onDelete}
      disabled={pending}
      className="gap-2 text-muted-foreground hover:text-danger"
      aria-label="Delete report"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      {label}
    </Button>
  );
}
