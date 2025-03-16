
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CustomSpinner = ({ size = "md", className }: CustomSpinnerProps) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <Loader2 
      className={cn("animate-spin text-muted-foreground", sizeMap[size], className)} 
    />
  );
};

export default CustomSpinner;
