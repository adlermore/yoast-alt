import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { CheckStatus } from "@/types";

export interface StatusMeta {
  icon: LucideIcon;
  label: string;
  /** Text color class. */
  className: string;
  /** Background dot class. */
  dot: string;
}

export const STATUS_META: Record<CheckStatus, StatusMeta> = {
  pass: {
    icon: CircleCheck,
    label: "Passed",
    className: "text-success",
    dot: "bg-success",
  },
  warning: {
    icon: CircleAlert,
    label: "Warnings",
    className: "text-warning",
    dot: "bg-warning",
  },
  error: {
    icon: CircleX,
    label: "Errors",
    className: "text-danger",
    dot: "bg-danger",
  },
  info: {
    icon: Info,
    label: "Info",
    className: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};
