import { useState, useEffect } from "react";
import TimeEntryForm from "./EntryForm";
import LoggedHoursDisplay from "./LoggedHours";
import { format } from "date-fns";
import CalendarView from "./Calendar-view";

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

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timeEntries", JSON.stringify(entries));
  }, [entries]);

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
    <div className="max-w-5xl mx-auto p-4">
      <TimeEntryForm
        onAddEntry={handleAddEntry}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <LoggedHoursDisplay
        entries={entries}
        totalHours={calculateTotalHours()}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
          <CalendarView/>
          </div>
  );
};

export default TimeEntry;
