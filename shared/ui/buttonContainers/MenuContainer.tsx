import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type MenuContainerProps = {
  children: ReactNode;
};

export default function MenuContainer({ children }: MenuContainerProps) {
  return <div className={cn("flex flex-col gap-1")}>{children}</div>;
}
