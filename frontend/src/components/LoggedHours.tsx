import { Button } from "@/components/ui/button";
import { Copy, Trash2, Settings, Folder, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { TimeEntryData } from "./TimeEntry";

interface LoggedHoursDisplayProps {
  entries: TimeEntryData[];
  totalHours?: string;
}

const LoggedHoursDisplay = ({
  entries = [],
  totalHours = "00:00:00",
}: LoggedHoursDisplayProps) => {
  // Format the total hours for display (from HH:MM:SS to HH:MM hrs)
  const formatTotalHours = (duration: string): string => {
    const [hours, minutes] = duration.split(":");
    return `${hours}:${minutes} hrs`;
  };

  // Function to format the time range (e.g., "10:00 - 11:30")
  const formatTimeRange = (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-gray-600">
            Today's logged hours:{" "}
            <strong>{formatTotalHours(totalHours)}</strong>
          </span>
          <div className="flex gap-2">
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
        {entries.length === 0 ? (
          <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center">
            <Folder className="h-16 w-16 text-gray-300 mb-4" />
            <p className="font-medium mb-1">No entries added yet</p>
            <p className="text-sm text-gray-500">
              You can add the entries from
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
                <span>{format(entries[0].date, "EEEE, MMMM d, yyyy")}</span>
              </div>
            </div>

            <div className="divide-y">
              {entries.map((entry) => (
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
