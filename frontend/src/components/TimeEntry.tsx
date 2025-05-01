import { useState } from "react";
import TimeEntryForm from "./EntryForm";
import ProgressTracker from "./ProgressTracker";
import LoggedHoursDisplay from "./LoggedHours";
import { format } from "date-fns";
import CalendarView from "./Calendar-view";

// Define types for project and task data that can be shared
export interface Task {
  task_id: string;
  task_name: string;
  billable: boolean;
  created_ts: string;
  updated_ts: string;
}

export interface Project {
  project_id: string;
  project_name: string;
  project_state: string;
  billable: boolean;
  start_date: string;
  end_date: string;
  type: string;
  phase: string;
  is_active: boolean;
  client_id: string;
  created_ts: string;
  updated_ts: string;
}

// Define types for our time entries
export interface TimeEntryData {
  id: string;
  description: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  startTime: string;
  endTime: string;
  duration: string; // in format HH:MM:SS
  date: Date;
  createdAt: Date;
}

// Type for grouped entries by date
export interface GroupedEntries {
  [date: string]: {
    entries: TimeEntryData[];
    totalDuration: string; // in format HH:MM:SS
  };
}

const TimeEntry = () => {
  // State for entries
  const [entries, setEntries] = useState<TimeEntryData[]>([]);

  // Function to add a new entry
  const addEntry = (newEntry: Omit<TimeEntryData, "id" | "createdAt">) => {
    const entry: TimeEntryData = {
      ...newEntry,
      id: generateId(),
      createdAt: new Date(),
    };

    setEntries((prevEntries) => [...prevEntries, entry]);
  };

  // Helper function to generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  };

  // Group entries by date
  const groupEntriesByDate = (): GroupedEntries => {
    const grouped: GroupedEntries = {};

    entries.forEach((entry) => {
      const dateKey = format(entry.date, "yyyy-MM-dd");

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          entries: [],
          totalDuration: "00:00:00",
        };
      }

      grouped[dateKey].entries.push(entry);

      // Calculate total duration for the day
      grouped[dateKey].totalDuration = calculateTotalDuration(
        grouped[dateKey].entries
      );
    });

    return grouped;
  };

  // Function to calculate total duration from an array of entries
  const calculateTotalDuration = (entries: TimeEntryData[]): string => {
    let totalSeconds = 0;

    entries.forEach((entry) => {
      const [hours, minutes, seconds] = entry.duration.split(":").map(Number);
      totalSeconds += hours * 3600 + minutes * 60 + seconds;
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Get entries for today
  const today = format(new Date(), "yyyy-MM-dd");
  const groupedEntries = groupEntriesByDate();
  const todaysEntries = groupedEntries[today]?.entries || [];
  const todaysTotalDuration =
    groupedEntries[today]?.totalDuration || "00:00:00";

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-xl font-semibold mb-4">Logged Hours</h1>

          {/* Time entry form component */}
          <TimeEntryForm onAddEntry={addEntry} />

          {/* Progress tracker component */}
          <ProgressTracker />

          {/* Logged hours display component */}
          <LoggedHoursDisplay
            entries={todaysEntries}
            totalHours={todaysTotalDuration}
          />
          <CalendarView/>
        </div>
      </div>
    </div>
  );
};

export default TimeEntry;
