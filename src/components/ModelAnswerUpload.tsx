
import { useState } from "react";
import { Question, ModelAnswer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, FileUp, HelpCircle, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AnswerPdfUpload from "./AnswerPdfUpload";

interface ModelAnswerUploadProps {
  questions: Question[];
  existingAnswers?: ModelAnswer[];
  onSave: (answers: ModelAnswer[]) => void;
}

const ModelAnswerUpload = ({ questions, existingAnswers = [], onSave }: ModelAnswerUploadProps) => {
  const { toast } = useToast();
  const [modelAnswers, setModelAnswers] = useState<ModelAnswer[]>(existingAnswers);
  const [uploadMethod, setUploadMethod] = useState<"manual" | "file">("manual");
  const [fileContent, setFileContent] = useState<string>("");
  const [usePdfAnswer, setUsePdfAnswer] = useState<Record<string, boolean>>({});

  const handleAnswerChange = (questionId: string, value: string | number) => {
    const updatedAnswers = [...modelAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = { 
        ...updatedAnswers[existingIndex], 
        answer: value 
      };
    } else {
      updatedAnswers.push({
        questionId,
        answer: value
      });
    }
    
    setModelAnswers(updatedAnswers);
  };
  
  const handleExplanationChange = (questionId: string, explanation: string) => {
    const updatedAnswers = [...modelAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = { 
        ...updatedAnswers[existingIndex], 
        explanation 
      };
    } else {
      updatedAnswers.push({
        questionId,
        answer: "",
        explanation
      });
    }
    
    setModelAnswers(updatedAnswers);
  };

  const handlePdfAnswerUploaded = (questionId: string, pdfUrl: string) => {
    const updatedAnswers = [...modelAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = { 
        ...updatedAnswers[existingIndex], 
        answerPdfUrl: pdfUrl,
        // Set answer to a placeholder when using PDF
        answer: "See PDF for model answer"
      };
    } else {
      updatedAnswers.push({
        questionId,
        answer: "See PDF for model answer",
        answerPdfUrl: pdfUrl
      });
    }
    
    setModelAnswers(updatedAnswers);
    setUsePdfAnswer({...usePdfAnswer, [questionId]: true});
  };

  const handlePdfAnswerRemoved = (questionId: string) => {
    const updatedAnswers = [...modelAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      const { answerPdfUrl, ...rest } = updatedAnswers[existingIndex];
      updatedAnswers[existingIndex] = { 
        ...rest,
        answer: "" // Clear the answer when removing PDF
      };
    }
    
    setModelAnswers(updatedAnswers);
    setUsePdfAnswer({...usePdfAnswer, [questionId]: false});
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setFileContent(content);
        
        // Try to parse JSON
        const jsonData = JSON.parse(content);
        if (Array.isArray(jsonData)) {
          const validAnswers = jsonData.filter(item => 
            item.questionId && (item.answer !== undefined || item.answer !== null)
          );
          
          if (validAnswers.length > 0) {
            setModelAnswers(validAnswers);
            toast({
              title: "Model Answers Imported",
              description: `Successfully imported ${validAnswers.length} model answers`,
            });
          } else {
            toast({
              title: "Invalid Format",
              description: "The uploaded file doesn't contain valid model answers",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        toast({
          title: "Error Parsing File",
          description: "Please make sure to upload a valid JSON file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };
  
  const getAnswerForQuestion = (questionId: string) => {
    return modelAnswers.find(a => a.questionId === questionId);
  };
  
  const handleSaveAnswers = () => {
    onSave(modelAnswers);
    toast({
      title: "Model Answers Saved",
      description: "These answers will be used for automated evaluation",
    });
  };
  
  const handleDownloadTemplate = () => {
    const template = questions.map(q => ({
      questionId: q.id,
      answer: q.type === "multiple-choice" ? 0 : "",
      explanation: ""
    }));
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model_answers_template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePdfAnswer = (questionId: string, enabled: boolean) => {
    setUsePdfAnswer({...usePdfAnswer, [questionId]: enabled});
    
    if (!enabled) {
      handlePdfAnswerRemoved(questionId);
    }
  };

  return (
    <Card className="shadow-md animate-scale-in">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-exam-primary mb-1">
              Model Answers
            </CardTitle>
            <CardDescription>
              Provide correct answers for automated evaluation
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 w-8 rounded-full p-0 text-slate-500"
                  onClick={() => {}}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Upload model answers to enable automated evaluation of student responses.
                  For multiple-choice questions, enter the index of the correct option (0-based).
                  For text answers, you can provide a text answer or upload a PDF.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="manual" onValueChange={(v) => setUploadMethod(v as "manual" | "file")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="manual">Enter Manually</TabsTrigger>
            <TabsTrigger value="file">Upload JSON File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Question {index + 1}</span>
                  <span className="text-xs bg-exam-light text-exam-primary px-2 py-0.5 rounded">
                    {question.points} points
                  </span>
                </div>
                
                <p className="mb-3">{question.content}</p>
                
                <div className="space-y-3">
                  {question.type === "multiple-choice" && question.options ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Correct Option:</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className={`
                              flex items-center p-2 rounded-md border 
                              ${getAnswerForQuestion(question.id)?.answer === optIndex 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                              }
                              cursor-pointer transition-colors
                            `}
                            onClick={() => handleAnswerChange(question.id, optIndex)}
                          >
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm mr-2">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {getAnswerForQuestion(question.id)?.answer === optIndex && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {question.type !== "pdf-upload" && (
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">
                            Correct Answer:
                          </label>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`pdf-toggle-${question.id}`}
                              checked={usePdfAnswer[question.id] || false}
                              onCheckedChange={(checked) => togglePdfAnswer(question.id, checked)}
                            />
                            <Label htmlFor={`pdf-toggle-${question.id}`} className="text-sm">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                Use PDF Answer
                              </div>
                            </Label>
                          </div>
                        </div>
                      )}
                      
                      {!usePdfAnswer[question.id] ? (
                        <Textarea 
                          placeholder="Enter the model answer"
                          value={getAnswerForQuestion(question.id)?.answer as string || ""}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="min-h-[100px]"
                        />
                      ) : (
                        <AnswerPdfUpload
                          onPdfUploaded={(url) => handlePdfAnswerUploaded(question.id, url)}
                          onPdfRemoved={() => handlePdfAnswerRemoved(question.id)}
                          existingPdfUrl={getAnswerForQuestion(question.id)?.answerPdfUrl}
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Explanation (Optional):</label>
                    <Textarea 
                      placeholder="Add explanation or grading criteria"
                      value={getAnswerForQuestion(question.id)?.explanation || ""}
                      onChange={(e) => handleExplanationChange(question.id, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <div className="border rounded-md p-6 border-dashed border-slate-300 dark:border-slate-700 text-center">
              <FileUp className="h-10 w-10 text-slate-400 mb-2 mx-auto" />
              
              <h3 className="font-medium text-lg mb-1">Upload Model Answers</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Upload a JSON file with model answers for this exam
              </p>
              
              <Input
                type="file"
                accept=".json"
                className="max-w-sm mx-auto"
                onChange={handleFileUpload}
              />
              
              <div className="mt-4 text-sm text-slate-500">
                <p>Don't have a template?</p>
                <Button 
                  variant="link" 
                  className="text-exam-accent dark:text-blue-400"
                  onClick={handleDownloadTemplate}
                >
                  Download template file
                </Button>
              </div>
            </div>
            
            {fileContent && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">File Content Preview:</h3>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-x-auto text-xs">
                  {fileContent.length > 1000 
                    ? fileContent.substring(0, 1000) + "..." 
                    : fileContent
                  }
                </pre>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-800/50 flex justify-between">
        <span className="text-sm text-slate-500">
          {modelAnswers.length} of {questions.length} questions answered
        </span>
        <Button 
          onClick={handleSaveAnswers}
          className="bg-exam-primary hover:bg-exam-primary/90"
        >
          Save Model Answers
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelAnswerUpload;
