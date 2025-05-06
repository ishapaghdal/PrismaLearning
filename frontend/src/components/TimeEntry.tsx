import { useState, useEffect } from "react";
import TimeEntryForm from "./EntryForm";
import LoggedHoursDisplay from "./LoggedHours";
import CalendarViewNew from "./CalendarViewNew";
import { Project, Task } from "@/types/event";

// Type definitions
export interface TimeEntryData {
  id: string; // This will be auto-generated
  description: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  startTime: Date;
  endTime: Date;
  duration: string;
  date: Date;
  createdAt?: Date;
}

const API_BASE_URL = "http://localhost:3000/api";

const TimeEntry = () => {
  const [entries, setEntries] = useState<TimeEntryData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});

  // Function to fetch projects from the backend
  const fetchProjects = async () => {
    try {
      // Use the full URL with the API base
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Required for handling cookies if your API uses authentication
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch projects: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchTasksForProject = async (projectId: string) => {
    try {
      // Use the full URL with the API base
      const response = await fetch(`${API_BASE_URL}/tasks/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Required for handling cookies if your API uses authentication
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tasks: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      setTasks((prev) => ({
        ...prev,
        [projectId]: data,
      }));
    } catch (err) {
      console.error(`Error fetching tasks for project ${projectId}:`, err);
    }
  };

  // Pre-fetch tasks for all projects to improve UX
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach((project) => {
        fetchTasksForProject(project.projectId);
      });
    }
  }, [projects]);

  useEffect(() => {
    const EMPLOYEE_ID = "676a4232ea1f026a913eabbe";

    const fetchEntries = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/time-entry?employee_id=${EMPLOYEE_ID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch time entries");
        }

        const data = await response.json();
        console.log("Fetched from backend:", data); // ✅ DEBUG

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
    fetchProjects();
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
    <div className="mx-12 my-8 flex flex-col w-full  overflow-auto">
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
      <CalendarViewNew entries={entries} projects={projects} tasks={tasks} />
      {/* <CalendarView entries={entries} projects={projects} tasks={tasks} /> */}
    </div>
  );
};

export default TimeEntry;
