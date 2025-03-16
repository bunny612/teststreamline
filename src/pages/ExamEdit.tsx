import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Exam, Question, QuestionType } from "@/types";
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
import { CalendarIcon, Clock, Trash2, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

// Mock data - in a real app, this would come from an API
const mockExam: Exam = {
  id: "1",
  title: "Midterm Examination",
  description: "Comprehensive assessment of first semester material",
  teacherId: "1",
  duration: 120,
  startDate: "2023-11-15T09:00:00.000Z",
  endDate: "2023-11-15T11:00:00.000Z",
  status: "scheduled",
  totalPoints: 100,
  questions: [
    {
      id: "q1",
      examId: "1",
      type: "multiple-choice",
      content: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2,
      points: 10,
    },
    {
      id: "q2",
      examId: "1",
      type: "short-answer",
      content: "Explain the water cycle in brief.",
      correctAnswer: "Evaporation, condensation, precipitation, collection",
      points: 15,
    }
  ]
};

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
  type: z.enum(["multiple-choice", "short-answer", "long-answer", "pdf-upload"]),
  content: z.string().min(3, { message: "Question must be at least 3 characters" }),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]).optional(),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" }),
});

const ExamEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "questions">("details");
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

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

  useEffect(() => {
    setTimeout(() => {
      setExam(mockExam);
      setLoading(false);
      
      examForm.reset({
        title: mockExam.title,
        description: mockExam.description,
        duration: mockExam.duration,
        startDate: new Date(mockExam.startDate),
        endDate: new Date(mockExam.endDate),
      });
    }, 1000);
  }, [id]);

  const handleSaveExam = (values: z.infer<typeof examFormSchema>) => {
    console.log("Saving exam details:", values);
    toast({
      title: "Exam Updated",
      description: "Exam details have been successfully updated",
    });
  };

  const handleEditQuestion = (index: number) => {
    if (!exam) return;
    
    const question = exam.questions[index];
    setEditingQuestion(index);
    
    questionForm.reset({
      type: question.type,
      content: question.content,
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer,
      points: question.points,
    });
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    questionForm.reset({
      type: "multiple-choice",
      content: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
    });
  };

  const handleSaveQuestion = (values: z.infer<typeof questionFormSchema>) => {
    if (!exam) return;
    
    const updatedQuestions = [...exam.questions];
    
    if (editingQuestion !== null) {
      updatedQuestions[editingQuestion] = {
        ...updatedQuestions[editingQuestion],
        ...values,
      };
    } else {
      const newQuestion: Question = {
        id: `q${exam.questions.length + 1}`,
        examId: exam.id,
        type: values.type,
        content: values.content,
        options: values.options,
        correctAnswer: values.correctAnswer,
        points: values.points,
      };
      updatedQuestions.push(newQuestion);
    }
    
    setExam({
      ...exam,
      questions: updatedQuestions,
      totalPoints: updatedQuestions.reduce((sum, q) => sum + q.points, 0),
    });
    
    toast({
      title: editingQuestion !== null ? "Question Updated" : "Question Added",
      description: editingQuestion !== null 
        ? "The question has been successfully updated" 
        : "A new question has been added to the exam",
    });
    
    setEditingQuestion(null);
    questionForm.reset();
  };

  const handleDeleteQuestion = (index: number) => {
    if (!exam) return;
    
    const updatedQuestions = exam.questions.filter((_, i) => i !== index);
    
    setExam({
      ...exam,
      questions: updatedQuestions,
      totalPoints: updatedQuestions.reduce((sum, q) => sum + q.points, 0),
    });
    
    toast({
      title: "Question Deleted",
      description: "The question has been removed from the exam",
    });
  };

  const handlePublish = () => {
    if (!exam) return;
    
    setExam({
      ...exam,
      status: "scheduled",
    });
    
    toast({
      title: "Exam Published",
      description: "The exam has been scheduled and is now visible to students",
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Exam Not Found</h2>
            <p className="text-muted-foreground mb-4">The exam you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate("/exams/manage")}>
              Back to Exam Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-exam-primary mb-2">Edit Exam</h1>
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={activeTab === "details" ? "default" : "outline"}
            className={activeTab === "details" ? "bg-exam-primary" : ""}
            onClick={() => setActiveTab("details")}
          >
            Exam Details
          </Button>
          <Button 
            variant={activeTab === "questions" ? "default" : "outline"}
            className={activeTab === "questions" ? "bg-exam-primary" : ""}
            onClick={() => setActiveTab("questions")}
          >
            Questions ({exam.questions.length})
          </Button>
        </div>
        
        {activeTab === "details" ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Exam Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...examForm}>
                <form onSubmit={examForm.handleSubmit(handleSaveExam)} className="space-y-6">
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
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-exam-primary">
                      Save Exam Details
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Exam Questions</CardTitle>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1" 
                  onClick={handleAddQuestion}
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </CardHeader>
              <CardContent className="pt-2">
                {editingQuestion !== null || questionForm.formState.isDirty ? (
                  <div className="border p-4 rounded-md mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingQuestion !== null ? "Edit Question" : "Add New Question"}
                    </h3>
                    
                    <Form {...questionForm}>
                      <form onSubmit={questionForm.handleSubmit(handleSaveQuestion)} className="space-y-4">
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
                                  <SelectItem value="pdf-upload">PDF Upload</SelectItem>
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
                        
                        {questionForm.watch("type") === "pdf-upload" && (
                          <FormField
                            control={questionForm.control}
                            name="pdfUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PDF URL</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter the PDF URL" 
                                    {...field} 
                                  />
                                </FormControl>
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
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setEditingQuestion(null);
                              questionForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-exam-primary">
                            {editingQuestion !== null ? "Update Question" : "Add Question"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : exam.questions.length > 0 ? (
                  <div className="space-y-4">
                    {exam.questions.map((question, index) => (
                      <div key={question.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-exam-light text-exam-primary text-xs px-2 py-1 rounded-full uppercase">
                              {question.type}
                            </span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {question.points} points
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditQuestion(index)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500" 
                              onClick={() => handleDeleteQuestion(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">No questions added yet.</p>
                    <Button onClick={handleAddQuestion} className="bg-exam-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Question
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/exams/manage")}
              >
                Back to Exams
              </Button>
              <Button 
                className="bg-exam-primary"
                onClick={handlePublish}
                disabled={exam.questions.length === 0}
              >
                {exam.status === "draft" ? "Publish Exam" : "Update Exam"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamEdit;
