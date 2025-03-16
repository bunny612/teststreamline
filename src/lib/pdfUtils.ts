
import { Exam, ExamAttempt, ExamResult } from "@/types";
import { format } from "date-fns";

/**
 * Utility to generate and download PDF exam papers or results
 * In a real application, this would use a library like jsPDF, html2canvas, or pdfmake
 * or call a backend service to generate the PDF
 */
export const downloadExamPDF = (exam: Exam): void => {
  // In a real application, this would generate a PDF document
  console.log("Generating PDF for exam:", exam.title);
  
  // Simulate PDF download
  setTimeout(() => {
    // Create a dummy blob to simulate the PDF
    const blob = new Blob(["This is a simulation of an exam PDF"], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam.title.replace(/\s+/g, "-").toLowerCase()}-exam.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
};

export const downloadResultsPDF = (exam: Exam, attempt?: ExamAttempt, results?: ExamResult[]): void => {
  // In a real application, this would generate a PDF document
  console.log("Generating PDF for results:", exam.title);
  
  // Simulate PDF download
  setTimeout(() => {
    // Create a dummy blob to simulate the PDF
    const blob = new Blob(["This is a simulation of an exam results PDF"], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = url;
    
    // Name the file appropriately
    if (attempt) {
      a.download = `${exam.title.replace(/\s+/g, "-").toLowerCase()}-evaluation.pdf`;
    } else {
      a.download = `${exam.title.replace(/\s+/g, "-").toLowerCase()}-all-results.pdf`;
    }
    
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
};
