
import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 text-exam-primary animate-spin" />
      <p className="mt-4 text-exam-primary font-medium">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
