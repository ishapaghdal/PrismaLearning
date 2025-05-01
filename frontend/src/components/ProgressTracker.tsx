import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  // You can add props as needed
}

const ProgressTracker = ({}: ProgressTrackerProps) => {
  // Current date for the calendar
  const [currentDate] = useState<Date>(new Date());

  // Mock data for the week days
  const weekDays = ["M", "T", "W", "T", "F"];
  const currentDayIndex = 3; // Thursday is highlighted in the image

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="font-medium">Day 24</span>
          <div className="w-4 h-4 bg-orange-500 rounded-full ml-1"></div>
        </div>
        <span className="text-gray-500">40%</span>
      </div>
      <Progress value={40} className="h-2 bg-gray-200" />

      <div className="flex justify-between items-center mt-6">
        <span className="font-medium">This week</span>

        <div className="flex items-center space-x-2">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                index === currentDayIndex
                  ? "bg-blue-600 text-white"
                  : "text-gray-500"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <span className="text-sm">Today, 12th March, 2025</span>
            <CalendarIcon className="h-4 w-4" />
          </div>

          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
