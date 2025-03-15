
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Question, QuestionType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Trash2, Plus, ChevronRight, ChevronLeft, FileText, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema for exam details
const examFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  duration: z.coerce.number().min(5, { message: "Duration must be at least 5 minutes" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
});

// Form schema for questions
const questionFormSchema = z.object({
  type: z.enum(["multiple-choice", "short-answer", "long-answer"]),
  content: z.string().min(3, { message: "Question must be at least 3 characters" }),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]).optional(),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" }),
});

const ExamCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examDetails, setExamDetails] = useState<z.infer<typeof examFormSchema> | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [questionInputMethod, setQuestionInputMethod] = useState<"individual" | "pdf">("individual");

  const examForm = useForm<z.infer<typeof examFormSchema>>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const questionForm = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      type: "multiple-choice",
      content: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
    },
  });

  const handleSaveExamDetails = (values: z.infer<typeof examFormSchema>) => {
    setExamDetails(values);
    setStep(2);
    toast({
      title: "Exam Details Saved",
      description: "Now you can add questions to your exam",
    });
  };

  const handleAddQuestion = (values: z.infer<typeof questionFormSchema>) => {
    if (!user) return;
    
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      examId: "temp-id", // Will be replaced when saved to backend
      type: values.type,
      content: values.content,
      options: values.options,
      correctAnswer: values.correctAnswer,
      points: values.points,
    };
    
    setQuestions([...questions, newQuestion]);
    
    toast({
      title: "Question Added",
      description: "Your question has been added to the exam",
    });
    
    // Reset form for next question
    questionForm.reset({
      type: "multiple-choice",
      content: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
    
    toast({
      title: "Question Removed",
      description: "The question has been removed from the exam",
    });
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      // Create a URL for the file preview
      const fileUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(fileUrl);
      
      toast({
        title: "PDF Uploaded",
        description: "Your question paper has been uploaded",
      });
    } else if (file) {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const removePdf = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfFile(null);
    setPdfPreviewUrl(null);
  };

  const handleCreateExam = () => {
    if (!examDetails || !user) return;
    
    // In a real app, this would be an API call to upload the PDF to a storage service
    // and get back a URL that we would store in the exam object
    
    const examToCreate = {
      ...examDetails,
      teacherId: user.id,
      questions,
      status: "draft" as const,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      pdfQuestionPaper: pdfPreviewUrl || undefined,
    };
    
    console.log("Creating exam with details:", examToCreate);
    
    toast({
      title: "Exam Created",
      description: questionInputMethod === "pdf" 
        ? "Your exam with PDF question paper has been successfully created" 
        : "Your exam has been successfully created",
    });
    
    // Navigate to manage exams page
    navigate("/exams/manage");
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/exams/manage");
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-exam-primary mb-2">Create New Exam</h1>
        
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-exam-primary text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-exam-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-exam-primary text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-exam-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-exam-primary text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Exam Details</span>
            <span>Add Questions</span>
            <span>Review & Create</span>
          </div>
        </div>
        
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...examForm}>
                <form onSubmit={examForm.handleSubmit(handleSaveExamDetails)} className="space-y-6">
                  <FormField
                    control={examForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter exam title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={examForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a description of the exam" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={examForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Input type="number" {...field} />
                              <Clock className="ml-2 h-5 w-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={examForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={examForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handleBack}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="bg-exam-primary">
                      Next Step
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {step === 2 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Add Questions</CardTitle>
              <div className="text-sm text-muted-foreground">
                {questions.length} questions | {questions.reduce((sum, q) => sum + q.points, 0)} total points
              </div>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="individual" 
                onValueChange={(value) => setQuestionInputMethod(value as "individual" | "pdf")}
                className="mb-6"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="individual">Create Individual Questions</TabsTrigger>
                  <TabsTrigger value="pdf">Upload PDF Question Paper</TabsTrigger>
                </TabsList>
                
                <TabsContent value="individual">
                  <div className="border p-4 rounded-md mb-6">
                    <Form {...questionForm}>
                      <form onSubmit={questionForm.handleSubmit(handleAddQuestion)} className="space-y-4">
                        <FormField
                          control={questionForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select question type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                  <SelectItem value="short-answer">Short Answer</SelectItem>
                                  <SelectItem value="long-answer">Long Answer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={questionForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question Text</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter your question here" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {questionForm.watch("type") === "multiple-choice" && (
                          <div className="space-y-2">
                            <FormLabel>Options</FormLabel>
                            {(questionForm.watch("options") || []).map((_, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  placeholder={`Option ${index + 1}`}
                                  value={questionForm.watch(`options.${index}`) || ""}
                                  onChange={(e) => {
                                    const newOptions = [...(questionForm.watch("options") || [])];
                                    newOptions[index] = e.target.value;
                                    questionForm.setValue("options", newOptions);
                                  }}
                                />
                                <input
                                  type="radio"
                                  checked={questionForm.watch("correctAnswer") === index}
                                  onChange={() => questionForm.setValue("correctAnswer", index)}
                                  className="h-4 w-4 text-exam-primary"
                                />
                              </div>
                            ))}
                            <FormDescription>
                              Select the radio button next to the correct answer.
                            </FormDescription>
                          </div>
                        )}
                        
                        {questionForm.watch("type") === "short-answer" && (
                          <FormField
                            control={questionForm.control}
                            name="correctAnswer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Correct Answer</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter the correct answer" 
                                    {...field} 
                                    value={field.value as string || ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  This will be used for auto-grading.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        <FormField
                          control={questionForm.control}
                          name="points"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Points</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit" className="bg-exam-primary">
                            Add Question
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </TabsContent>
                
                <TabsContent value="pdf">
                  <div className="border p-4 rounded-md mb-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Upload PDF Question Paper</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload a PDF file containing all your exam questions. Students will be able to download and view this file during the exam.
                        </p>
                        
                        {!pdfFile ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">Drag and drop your PDF here, or click to browse</p>
                            <label htmlFor="pdf-upload" className="cursor-pointer">
                              <div className="bg-exam-primary text-white px-4 py-2 rounded-md flex items-center">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload PDF
                              </div>
                              <input 
                                id="pdf-upload" 
                                type="file" 
                                className="hidden" 
                                accept="application/pdf" 
                                onChange={handlePdfUpload}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="border rounded-md p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <FileText className="h-6 w-6 text-exam-primary mr-2" />
                                <span className="font-medium">{pdfFile.name}</span>
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
                            
                            {pdfPreviewUrl && (
                              <div className="mt-4 border rounded">
                                <div className="bg-gray-100 p-2 flex justify-between items-center">
                                  <span className="text-sm font-medium">PDF Preview</span>
                                  <a 
                                    href={pdfPreviewUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-exam-primary"
                                  >
                                    Open in new tab
                                  </a>
                                </div>
                                <iframe 
                                  src={pdfPreviewUrl} 
                                  className="w-full h-[400px] border-0" 
                                  title="PDF Preview"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <FormItem>
                        <FormLabel>Total Points for PDF Exam</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter total points for this exam"
                            value={questions.reduce((sum, q) => sum + q.points, 0) || 100}
                            onChange={(e) => {
                              if (pdfFile) {
                                // Create a single question that represents the whole PDF
                                const totalPoints = parseInt(e.target.value) || 100;
                                setQuestions([{
                                  id: "q1",
                                  examId: "temp-id",
                                  type: "pdf-upload",
                                  content: "PDF Question Paper",
                                  points: totalPoints,
                                  pdfUrl: pdfPreviewUrl || undefined
                                }]);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Set the total points for this PDF exam paper
                        </FormDescription>
                      </FormItem>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {questionInputMethod === "individual" && (
                <>
                  {questions.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      <h3 className="font-medium">Added Questions:</h3>
                      {questions.map((question, index) => (
                        <div key={index} className="border p-4 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="bg-exam-light text-exam-primary text-xs px-2 py-1 rounded-full uppercase">
                                {question.type}
                              </span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {question.points} points
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500" 
                              onClick={() => handleRemoveQuestion(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="mt-2 font-medium">{question.content}</p>
                          
                          {question.type === "multiple-choice" && question.options && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div 
                                  key={optIndex} 
                                  className={cn(
                                    "flex items-center p-2 rounded-md",
                                    question.correctAnswer === optIndex ? "bg-green-50 border border-green-200" : ""
                                  )}
                                >
                                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm mr-2">
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  {option}
                                  {question.correctAnswer === optIndex && (
                                    <span className="ml-auto text-green-600 text-sm font-medium">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.type === "short-answer" && (
                            <div className="mt-2 p-2 bg-slate-50 rounded-md">
                              <p className="text-sm text-muted-foreground">Expected answer:</p>
                              <p className="font-medium">{question.correctAnswer as string}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 mb-6">
                      <p className="text-muted-foreground">No questions added yet. Add your first question above.</p>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="bg-exam-primary"
                  disabled={(questionInputMethod === "individual" && questions.length === 0) || 
                            (questionInputMethod === "pdf" && !pdfFile)}
                >
                  Review Exam
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {step === 3 && examDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Create Exam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">Exam Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{examDetails.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{examDetails.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(examDetails.startDate, "PPP")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{format(examDetails.endDate, "PPP")}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium">{examDetails.description}</p>
                    </div>
                  </div>
                </div>
                
                {questionInputMethod === "pdf" && pdfFile ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">PDF Question Paper</h3>
                      <p className="text-sm text-muted-foreground">
                        Total Points: {questions.reduce((sum, q) => sum + q.points, 0) || 100}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-4">
                        <FileText className="h-6 w-6 text-exam-primary mr-2" />
                        <span className="font-medium">{pdfFile.name}</span>
                      </div>
                      
                      {pdfPreviewUrl && (
                        <div className="border rounded">
                          <div className="bg-gray-100 p-2 flex justify-between items-center">
                            <span className="text-sm font-medium">PDF Preview</span>
                            <a 
                              href={pdfPreviewUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-exam-primary"
                            >
                              Open in new tab
                            </a>
                          </div>
                          <iframe 
                            src={pdfPreviewUrl} 
                            className="w-full h-[300px] border-0" 
                            title="PDF Preview"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
                      <p className="text-sm text-muted-foreground">
                        Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
                      </p>
                    </div>
                    
                    {questions.map((question, index) => (
                      <div key={index} className="border p-4 rounded-md mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-medium">Question {index + 1}</span>
                            <span className="ml-2 bg-exam-light text-exam-primary text-xs px-2 py-1 rounded-full uppercase">
                              {question.type}
                            </span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {question.points} points
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 font-medium">{question.content}</p>
                        
                        {question.type === "multiple-choice" && question.options && (
                          <div className="mt-2 space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className={cn(
                                  "flex items-center p-2 rounded-md",
                                  question.correctAnswer === optIndex ? "bg-green-50 border border-green-200" : ""
                                )}
                              >
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm mr-2">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                {option}
                                {question.correctAnswer === optIndex && (
                                  <span className="ml-auto text-green-600 text-sm font-medium">
                                    Correct
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.type === "short-answer" && (
                          <div className="mt-2 p-2 bg-slate-50 rounded-md">
                            <p className="text-sm text-muted-foreground">Expected answer:</p>
                            <p className="font-medium">{question.correctAnswer as string}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleCreateExam} 
                className="bg-exam-primary"
              >
                Create Exam
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExamCreate;
