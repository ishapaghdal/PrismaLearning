import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, MoreVertical } from "lucide-react";

// API base URL - this should be configured based on your environment
const API_BASE_URL = "http://localhost:3000/api"; // Replace with your actual backend URL

// Define types for project and task data from backend
interface Task {
  task_id: string;
  task_name: string;
  billable: boolean;
  created_ts: string;
  updated_ts: string;
}

interface Project {
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

interface TimeEntryFormProps {
  // You can add props as needed
}

const TimeEntryForm = ({}: TimeEntryFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endTime, setEndTime] = useState<string>("10:10");
  const [task, setTask] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [timerValue, setTimerValue] = useState<string>("00:00:00");

  // State for projects and tasks data
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch tasks when a project is selected
  useEffect(() => {
    if (project) {
      const selectedProjectId = project.split("-")[0];
      fetchTasksForProject(selectedProjectId);
    }
  }, [project]);

  // Calculate time difference when startTime or endTime changes
  useEffect(() => {
    calculateTimeDifference();
  }, [startTime, endTime]);

  // Function to fetch projects from the backend
  const fetchProjects = async () => {
    setLoading(true);
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
      console.log("Projects fetched:", data);
      setProjects(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Error fetching projects");
      setLoading(false);
    }
  };

  // Function to fetch tasks for a specific project
  const fetchTasksForProject = async (projectId: string) => {
    // Check if we already have tasks for this project
    if (tasks[projectId]) {
      return;
    }

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
      console.log(`Tasks for project ${projectId} fetched:`, data);

      setTasks((prev) => ({
        ...prev,
        [projectId]: data,
      }));
    } catch (err) {
      console.error(`Error fetching tasks for project ${projectId}:`, err);
    }
  };

  // Function to calculate the time difference between start and end time
  const calculateTimeDifference = () => {
    try {
      // Parse the time strings to create Date objects
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      // Create Date objects for calculation
      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0);

      const endDate = new Date();
      endDate.setHours(endHours, endMinutes, 0);

      // Calculate the difference in milliseconds
      let diffMs = endDate.getTime() - startDate.getTime();

      // If end time is earlier than start time, assume it's for the next day
      if (diffMs < 0) {
        endDate.setDate(endDate.getDate() + 1);
        diffMs = endDate.getTime() - startDate.getTime();
      }

      // Convert to hours, minutes, seconds
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      // Format as HH:MM:SS
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      setTimerValue(formattedTime);
    } catch (error) {
      console.error("Error calculating time difference:", error);
      setTimerValue("00:00:00");
    }
  };

  // Handle start time change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  // Handle end time change
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  // Group projects by type or other criteria to display in dropdown
  const groupedProjects = projects.reduce(
    (acc, project) => {
      const groupName = project.type || "Other";
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(project);
      return acc;
    },
    {} as Record<string, Project[]>
  );

  // Function to get color for project type
  const getProjectTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      Research: "orange",
      Development: "pink",
      Design: "purple",
      // Add more types and colors as needed
    };

    return colorMap[type] || "gray";
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="What are you working on?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 min-w-[200px]"
        />

        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Project">
              {project && (
                <>
                  {
                    projects.find(
                      (p) =>
                        `${p.project_id}-${p.project_name}` ===
                        project.split("-task")[0]
                    )?.project_name
                  }
                  {project.includes("-task") &&
                    `: ${project.split("-task")[1]}`}
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <div className="py-2 px-2 text-center">Loading projects...</div>
            ) : error ? (
              <div className="py-2 px-2 text-center text-red-500">{error}</div>
            ) : projects.length === 0 ? (
              <div className="py-2 px-2 text-center">No projects available</div>
            ) : (
              Object.entries(groupedProjects).map(
                ([groupName, groupProjects]) => (
                  <div
                    key={groupName}
                    className="py-2 border-t first:border-t-0"
                  >
                    <div className="flex items-center px-2 pb-1 pt-1">
                      <span
                        className={`h-2 w-2 rounded-full bg-${getProjectTypeColor(groupName)}-500 mr-2`}
                      ></span>
                      <span className="font-medium">{groupName}</span>
                    </div>
                    {groupProjects.map((proj) => (
                      <div key={proj.project_id}>
                        <SelectItem
                          value={`${proj.project_id}-${proj.project_name}`}
                          className="pl-4"
                        >
                          {proj.project_name}
                        </SelectItem>

                        {/* Show tasks if they exist for this project */}
                        {tasks[proj.project_id]?.map((task) => (
                          <SelectItem
                            key={task.task_id}
                            value={`${proj.project_id}-${proj.project_name}-task${task.task_id}`}
                            className="pl-8 text-sm"
                          >
                            {task.task_name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              )
            )}
          </SelectContent>
        </Select>

        <Input
          type="time"
          value={startTime}
          onChange={handleStartTimeChange}
          className="w-[100px]"
        />

        <span className="text-gray-400">-</span>

        <Input
          type="time"
          value={endTime}
          onChange={handleEndTimeChange}
          className="w-[100px]"
        />

        <div className="w-[100px] px-3 py-2 border rounded-md text-gray-500">
          {timerValue}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[120px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "MM/dd/yy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Add
        </Button>

        <Button variant="ghost" size="icon">
          <Clock className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TimeEntryForm;
