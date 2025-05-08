import { Button } from "@/components/ui/button";
import {
  Copy,
  Trash2,
  Settings,
  Folder,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, isToday, isSameDay } from "date-fns";
import { TimeEntryData } from "./TimeEntry";

interface LoggedHoursDisplayProps {
  entries: TimeEntryData[];
  totalHours?: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const LoggedHoursDisplay = ({
  entries = [],
  totalHours = "00:00:00",
  selectedDate,
  onDateChange,
}: LoggedHoursDisplayProps) => {
  // Format the total hours for display (from HH:MM:SS to HH:MM hrs)
  const formatTotalHours = (duration: string): string => {
    const [hours, minutes] = duration.split(":");
    return `${hours}:${minutes} hrs`;
  };

  // Function to format the time range (e.g., "10:00 - 11:30")
  const formatTimeRange = (startTime: Date | string, endTime: Date | string): string => {
    try {
      // Convert to Date objects if they're strings
      const start = typeof startTime === 'string' ? new Date(`2000-01-01T${startTime}`) : startTime;
      const end = typeof endTime === 'string' ? new Date(`2000-01-01T${endTime}`) : endTime;

      // Format to HH:mm
      const formatTime = (date: Date) => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      };

      return `${formatTime(start)} - ${formatTime(end)}`;
    } catch (error) {
      console.error('Error formatting time range:', error);
      return 'Invalid time range';
    }
  };

  // Filter entries for the selected date and sort by start time (latest first)
  const filteredEntries = entries
    .filter((entry) => isSameDay(new Date(entry.date), selectedDate))
    .sort((a, b) => {
      const timeA = new Date(`2000-01-01T${typeof a.startTime === 'string' ? a.startTime : format(a.startTime, 'HH:mm')}`).getTime();
      const timeB = new Date(`2000-01-01T${typeof b.startTime === 'string' ? b.startTime : format(b.startTime, 'HH:mm')}`).getTime();
      return timeB - timeA; // Sort in descending order (latest first)
    });

  // Calculate total hours for filtered entries
  const calculateTotalHours = (): string => {
    if (filteredEntries.length === 0) return "00:00:00";

    let totalSeconds = 0;

    filteredEntries.forEach((entry) => {
      const [hours, minutes, seconds] = entry.duration.split(":").map(Number);
      totalSeconds += hours * 3600 + minutes * 60 + seconds;
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle date navigation
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Get display text for the date header
  const getDateHeaderText = () => {
    if (isToday(selectedDate)) {
      return "Today's logged hours:";
    } else {
      return `Logged hours for ${format(selectedDate, "MMM d")}:`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center">
            <span className="text-gray-600">
              {getDateHeaderText()}{" "}
              <strong>{formatTotalHours(calculateTotalHours())}</strong>
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center border rounded-md overflow-hidden mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-2 text-sm"
                onClick={handleToday}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextDay}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <Copy className="h-4 w-4" />
              </div>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <Trash2 className="h-4 w-4" />
              </div>
            </Button>
            <Button variant="outline" className="text-gray-500">
              Select
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1 text-gray-500"
            >
              <Settings className="h-4 w-4" />
              Customise
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center">
            <Folder className="h-16 w-16 text-gray-300 mb-4" />
            <p className="font-medium mb-1">
              No entries for {format(selectedDate, "MMMM d, yyyy")}
            </p>
            <p className="text-sm text-gray-500">
              You can add entries from
              <br />
              the action card or add a project to start.
            </p>
          </div>
        ) : (
          // Display entries
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-50 p-3 border-b flex items-center">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
            </div>

            <div className="divide-y">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-1">
                        {entry.description}
                      </h4>
                      <div className="text-sm text-gray-600 flex items-center gap-3">
                        <span>
                          {entry.projectName}
                          {entry.taskName ? `: ${entry.taskName}` : ""}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatTimeRange(entry.startTime, entry.endTime)}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-700 font-medium">
                      {entry.duration.substring(0, 5)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoggedHoursDisplay;
