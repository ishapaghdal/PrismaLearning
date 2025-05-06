import { useState, useEffect } from "react";
import TimeEntryForm from "./EntryForm";
import LoggedHoursDisplay from "./LoggedHours";
import CalendarView from "./CalendarView";
import ProgressTracker from "./ProgressTracker";

// Constant for employee ID
const EMPLOYEE_ID = "605c5c469b9a512b4b59a22d";

// Type definitions
export interface TimeEntryData {
  id: string; // This will be auto-generated
  description: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  startTime: string;
  endTime: string;
  duration: string;
  date: Date;
  createdAt?: Date;
}

export interface Project {
  project_id: string;
  project_name: string;
  type: string;
  color?: string;
}

export interface Task {
  task_id: string;
  project_id: string;
  task_name: string;
}

const TimeEntry = () => {
  const [entries, setEntries] = useState<TimeEntryData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Load entries from localStorage on component mount
  useEffect(() => {
    const storedEntries = localStorage.getItem("timeEntries");
    if (storedEntries) {
      try {
        // Parse the stored entries and convert date strings back to Date objects
        const parsedEntries = JSON.parse(storedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          createdAt: entry.createdAt ? new Date(entry.createdAt) : undefined,
        }));
        setEntries(parsedEntries);
      } catch (error) {
        console.error("Error parsing stored entries:", error);
      }
    }
  }, []);

  // Fetch time entries for the specific employee
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/time-entry?employee_id=${EMPLOYEE_ID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch time entries");
        }

        const data = await response.json();
        console.log("Fetched time entries from backend:", data);

        const formatted = data.map((entry: any) => ({
          id: entry.time_entry_id,
          description: entry.description,
          projectId: entry.project_id,
          projectName: entry.Project?.project_name || "Unnamed Project",
          taskId: entry.task_id,
          taskName: entry.Task?.task_name || "",
          startTime: new Date(entry.start_time).toTimeString().slice(0, 5),
          endTime: new Date(entry.end_time).toTimeString().slice(0, 5),
          duration: entry.duration,
          date: new Date(entry.start_time),
          createdAt: new Date(entry.created_ts),
        }));

        setEntries(formatted);
      } catch (error) {
        console.error("Error fetching time entries from backend:", error);
      }
    };

    fetchEntries();
  }, []);

  // Handle adding a new entry
  const handleAddEntry = (
    newEntry: Omit<TimeEntryData, "id" | "createdAt">
  ) => {
    const entry: TimeEntryData = {
      ...newEntry,
      id: `entry-${Date.now()}`,
      createdAt: new Date(),
    };

    setEntries([...entries, entry]);

    // If adding an entry for the selected date, update the selectedDate to show it immediately
    if (
      newEntry.date &&
      newEntry.date.toDateString() !== selectedDate.toDateString()
    ) {
      setSelectedDate(new Date(newEntry.date));
    }
  };

  // Calculate total hours for the selected date
  const calculateTotalHours = (): string => {
    // This is now handled inside the LoggedHoursDisplay component
    return "00:00:00";
  };

  return (
    <div className="mx-5 my-8 flex flex-col w-full overflow-auto">
      <TimeEntryForm
        onAddEntry={handleAddEntry}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <ProgressTracker />
      <LoggedHoursDisplay
        entries={entries}
        totalHours={calculateTotalHours()}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <CalendarView entries={entries} />
    </div>
  );
};

export default TimeEntry;
