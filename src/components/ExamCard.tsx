
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Exam } from "@/types";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Clock, FileText } from "lucide-react";
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

  const getStatusBadge = () => {
    switch(type) {
      case 'available':
        return <span className="px-2.5 py-1 bg-exam-accent/10 text-exam-accent text-xs rounded-full font-medium flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-exam-accent mr-1.5"></span>Available</span>;
      case 'upcoming':
        return <span className="px-2.5 py-1 bg-exam-light text-exam-secondary text-xs rounded-full font-medium flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-exam-secondary mr-1.5"></span>Upcoming</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-exam-success/10 text-exam-success text-xs rounded-full font-medium flex items-center"><Award className="w-3 h-3 mr-1" />Completed</span>;
      case 'draft':
        return <span className="px-2.5 py-1 bg-exam-warning/10 text-exam-warning text-xs rounded-full font-medium flex items-center"><FileText className="w-3 h-3 mr-1" />Draft</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 bg-exam-primary/10 text-exam-primary text-xs rounded-full font-medium flex items-center"><Calendar className="w-3 h-3 mr-1" />Scheduled</span>;
      default:
        return null;
    }
  };

  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:shadow-exam-accent/5 hover:border-exam-accent/20 bg-gradient-to-b from-white to-exam-light/30 dark:from-exam-dark dark:to-exam-primary/5">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-exam-primary dark:text-white">
            {exam.title}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {exam.description}
        </p>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4 text-exam-accent" />
            <span>{exam.duration} minutes</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 text-exam-accent" />
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
            className="w-full bg-exam-accent hover:bg-exam-accent/90 text-white transition-all group-hover:shadow-md"
            onClick={() => navigate(`/exams/take/${exam.id}`)}
          >
            Start Exam
          </Button>
        )}
        
        {type === 'upcoming' && (
          <Button 
            variant="outline" 
            className="w-full border-exam-accent/20 text-exam-accent hover:bg-exam-accent/5"
            onClick={() => navigate(`/exams/details/${exam.id}`)}
          >
            View Details
          </Button>
        )}
        
        {type === 'completed' && (
          <Button 
            variant="outline" 
            className="w-full border-exam-success/20 text-exam-success hover:bg-exam-success/5"
            onClick={() => navigate(`/results/${exam.id}`)}
          >
            View Results
          </Button>
        )}
        
        {(type === 'draft' || type === 'scheduled') && (
          <Button 
            variant="outline" 
            className="w-full border-exam-primary/20 text-exam-primary hover:bg-exam-primary/5"
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
