
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomSpinner from "./CustomSpinner";

interface AnswerPdfUploadProps {
  onPdfUploaded: (pdfUrl: string) => void;
  onPdfRemoved: () => void;
  existingPdfUrl?: string;
}

const AnswerPdfUpload = ({ 
  onPdfUploaded, 
  onPdfRemoved, 
  existingPdfUrl 
}: AnswerPdfUploadProps) => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(existingPdfUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      
      // Create a URL for the file preview
      const fileUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(fileUrl);
      onPdfUploaded(fileUrl);
      
      toast({
        title: "PDF Uploaded",
        description: "Your answer PDF has been uploaded",
      });
      
      // In a real application, you would upload the file to a server here
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    } else if (file) {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const removePdf = () => {
    if (pdfPreviewUrl && !existingPdfUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfFile(null);
    setPdfPreviewUrl(null);
    onPdfRemoved();
  };

  return (
    <div className="border rounded-md p-4 mt-2">
      <h3 className="font-medium mb-2">Model Answer PDF</h3>
      
      {!pdfPreviewUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Upload a PDF file with the model answer
          </p>
          <label htmlFor="pdf-answer-upload" className="cursor-pointer">
            <div className="bg-exam-primary text-white px-3 py-1.5 rounded-md flex items-center">
              <Upload className="mr-1 h-4 w-4" />
              Upload PDF
            </div>
            <input
              id="pdf-answer-upload"
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handlePdfUpload}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-exam-primary mr-2" />
              <span className="font-medium text-sm">
                {pdfFile?.name || "Model Answer PDF"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              onClick={removePdf}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {isUploading ? (
            <div className="flex justify-center p-4">
              <CustomSpinner size="md" />
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-2">
              <div className="bg-white dark:bg-slate-800 p-2 flex justify-between items-center rounded-t-sm">
                <span className="text-xs font-medium">PDF Preview</span>
                <a
                  href={pdfPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-exam-primary"
                >
                  Open in new tab
                </a>
              </div>
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-[200px] border-0 rounded-b-sm"
                title="PDF Preview"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnswerPdfUpload;
