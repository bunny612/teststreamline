
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Exam } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface ExamCardProps {
  exam: Exam;
  type: 'upcoming' | 'available' | 'completed' | 'draft' | 'scheduled';
}

const ExamCard = ({ exam, type }: ExamCardProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{exam.title}</CardTitle>
          {type === 'available' && (
            <span className="px-2 py-1 bg-exam-accent text-exam-primary text-xs rounded-full font-medium">
              Available
            </span>
          )}
          {type === 'upcoming' && (
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
              Upcoming
            </span>
          )}
          {type === 'completed' && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              Completed
            </span>
          )}
          {type === 'draft' && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
              Draft
            </span>
          )}
          {type === 'scheduled' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              Scheduled
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground mb-4">
          {exam.description}
        </p>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>{exam.duration} minutes</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {type === 'completed' 
                ? `Completed on ${formatDate(exam.endDate)}`
                : `${formatDate(exam.startDate)} - ${formatDate(exam.endDate)}`
              }
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {type === 'available' && (
          <Button 
            className="w-full bg-exam-primary hover:bg-exam-dark"
            onClick={() => navigate(`/exams/take/${exam.id}`)}
          >
            Start Exam
          </Button>
        )}
        
        {type === 'upcoming' && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate(`/exams/details/${exam.id}`)}
          >
            View Details
          </Button>
        )}
        
        {type === 'completed' && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate(`/results/${exam.id}`)}
          >
            View Results
          </Button>
        )}
        
        {(type === 'draft' || type === 'scheduled') && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate(`/exams/edit/${exam.id}`)}
          >
            Edit Exam
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ExamCard;
