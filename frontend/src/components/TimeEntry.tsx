import { useState } from "react";
import TimeEntryForm from "./EntryForm";
import ProgressTracker from "./ProgressTracker";
import LoggedHoursDisplay from "./LoggedHours";

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

const TimeEntry = () => {
  // State for entries - this could be moved to a context or state management solution
  const [entries] = useState<any[]>([]); // Replace with your actual entry type

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-xl font-semibold mb-4">Logged Hours</h1>

          {/* Time entry form component */}
          <TimeEntryForm />

          {/* Progress tracker component */}
          <ProgressTracker />

          {/* Logged hours display component */}
          <LoggedHoursDisplay entries={entries} />
        </div>
      </div>
    </div>
  );
};

export default TimeEntry;
