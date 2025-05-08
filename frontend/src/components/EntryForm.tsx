import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isSameDay } from "date-fns";
import {
  CalendarIcon,
  Clock,
  MoreVertical,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

// Define Project and Task interfaces
interface Project {
  project_id: string;
  project_name: string;
  type?: string;
}

interface Task {
  task_id: string;
  task_name: string;
}

interface TimeEntryData {
  id: string;
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

// API base URL - this should be configured based on your environment
const API_BASE_URL = "http://localhost:3000/api";

interface TimeEntryFormProps {
  entries: TimeEntryData[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddEntry: (entry: Omit<TimeEntryData, "id" | "createdAt">) => void;
}

interface SelectedProject {
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
}

interface ValidationErrors {
  description?: string;
  project?: string;
  time?: string;
}

const TimeEntryForm = ({
  entries,
  selectedDate,
  onDateChange,
  onAddEntry,
}: TimeEntryFormProps) => {
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endTime, setEndTime] = useState<string>("10:10");
  const [description, setDescription] = useState<string>("");
  const [selectedProject, setSelectedProject] =
    useState<SelectedProject | null>(null);
  const [timerValue, setTimerValue] = useState<string>("00:00:00");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showErrors, setShowErrors] = useState<boolean>(false);

  // State for projects and tasks data
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get the last entry's end time for the selected date
  const getLastEntryEndTime = (): string => {
    const entriesForSelectedDate = entries.filter(entry => 
      isSameDay(new Date(entry.date), selectedDate)
    );

    if (entriesForSelectedDate.length === 0) {
      return "10:00"; // Default start time if no entries
    }

    // Sort entries by end time and get the latest one
    const sortedEntries = [...entriesForSelectedDate].sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.endTime}`).getTime();
      const timeB = new Date(`2000-01-01T${b.endTime}`).getTime();
      return timeB - timeA;
    });

    // Convert Date to time string (HH:mm format)
    const endTime = sortedEntries[0].endTime;
    if (endTime instanceof Date) {
      return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    }
    return endTime;
  };

  // Function to add one hour to a time string
  const addOneHour = (timeStr: string): string => {
    try {
      // Parse the time string
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Create a date object for the current day
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      // Add one hour
      date.setHours(date.getHours() + 1);
      
      // Format back to HH:mm
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error adding one hour:', error);
      return "10:10"; // Fallback time
    }
  };

  // Update times when selected date changes or entries change
  useEffect(() => {
    const lastEndTime = getLastEntryEndTime();
    setStartTime(lastEndTime);
    setEndTime(addOneHour(lastEndTime));
  }, [selectedDate, entries]);

  // Fetch projects when component mounts
  useEffect(() => {
    const EMPLOYEE_ID = "605c5c469b9a512b4b59a22d";
    fetchProjectsByEmployeeId(EMPLOYEE_ID);
  }, []);

  // Pre-fetch tasks for all projects to improve UX
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach((project) => {
        fetchTasksForProject(project.project_id);
      });
    }
  }, [projects]);

  // Calculate time difference when startTime or endTime changes
  useEffect(() => {
    calculateTimeDifference();
  }, [startTime, endTime]);

  // Reset validation errors when input changes
  useEffect(() => {
    if (showErrors) {
      validateForm();
    }
  }, [description, selectedProject, startTime, endTime, showErrors]);

  // Function to fetch projects from the backend
  const fetchProjectsByEmployeeId = async (employeeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/employee-projects/${employeeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch projects for employee ${employeeId}: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json();
      if (responseData.success && Array.isArray(responseData.data)) {
        setProjects(responseData.data);
      } else {
        throw new Error("Invalid response format from server");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects by employee ID:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error fetching projects by employee ID"
      );
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
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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

  // Function to validate the form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!description.trim()) {
      errors.description = "Please enter what you are working on";
    }

    if (!selectedProject) {
      errors.project = "Please select a project";
    }

    if (timerValue === "00:00:00") {
      errors.time = "Please enter a valid time range";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to handle form submission
  const handleAddEntry = async () => {
    setShowErrors(true);
    const isValid = validateForm();

    if (!isValid || !selectedProject) return;

    const newEntry: Omit<TimeEntryData, "id" | "createdAt"> = {
      description,
      projectId: selectedProject.projectId,
      projectName: selectedProject.projectName,
      taskId: selectedProject?.taskId,
      taskName: selectedProject?.taskName,
      startTime: new Date(`2000-01-01T${startTime}`),
      endTime: new Date(`2000-01-01T${endTime}`),
      duration: timerValue,
      date: selectedDate,
    };

    // 1. Add entry to UI
    onAddEntry(newEntry);

    // 2. Save entry to backend
    try {
      const payload = {
        description,
        start_time: `${format(selectedDate, "yyyy-MM-dd")}T${startTime}:00`,
        end_time: `${format(selectedDate, "yyyy-MM-dd")}T${endTime}:00`,
        duration: timerValue,
        billable: true,
        project_id: selectedProject.projectId,
        task_id: selectedProject?.taskId,
      };

      const response = await fetch("http://localhost:3000/api/time-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create time entry");
      }

      await response.json(); // Just await the response, we don't need the result
      
      // Reset form
      setDescription("");
      setSelectedProject(null);
      setShowErrors(false);
      
      // Times will be automatically updated by the useEffect
    } catch (error) {
      console.error("Error saving time entry:", error);
    }
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

  // Function to handle project selection
  const handleProjectSelect = (project: Project) => {
    setSelectedProject({
      projectId: project.project_id,
      projectName: project.project_name,
    });

    // Ensure tasks for this project are fetched
    if (!tasks[project.project_id]) {
      fetchTasksForProject(project.project_id);
    }
  };

  // Function to handle task selection
  const handleTaskSelect = (project: Project, task: Task) => {
    setSelectedProject({
      projectId: project.project_id,
      projectName: project.project_name,
      taskId: task.task_id,
      taskName: task.task_name,
    });
    setDropdownOpen(false);
  };

  // Render the display value for the project selector
  const renderProjectSelectorValue = () => {
    if (!selectedProject) return "Select Project";

    if (selectedProject.taskName) {
      return `${selectedProject.projectName}: ${selectedProject.taskName}`;
    }

    return selectedProject.projectName;
  };

  // Handle date change from calendar
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Input
            placeholder="What are you working on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full ${
              validationErrors.description && showErrors
                ? "border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          {validationErrors.description && showErrors && (
            <div className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {validationErrors.description}
            </div>
          )}
        </div>

        <div className="relative">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`w-[180px] justify-between text-left font-normal overflow-hidden text-ellipsis whitespace-nowrap ${
                  validationErrors.project && showErrors
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }`}
              >
                <span className="truncate">{renderProjectSelectorValue()}</span>
                <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="py-2 px-2 text-center">Loading projects...</div>
              ) : error ? (
                <div className="py-2 px-2 text-center text-red-500">
                  {error}
                </div>
              ) : projects.length === 0 ? (
                <div className="py-2 px-2 text-center">
                  No projects available
                </div>
              ) : (
                Object.entries(groupedProjects).map(
                  ([groupName, groupProjects]) => (
                    <div key={groupName} className="border-b last:border-b-0">
                      <div className="flex items-center px-2 py-1">
                        <div
                          className={`h-2 w-2 rounded-full bg-${getProjectTypeColor(
                            groupName
                          )}-500 mr-2`}
                        ></div>
                        <span className="font-medium">{groupName}</span>
                      </div>

                      {groupProjects.map((project) => (
                        <DropdownMenuSub key={project.project_id}>
                          <DropdownMenuSubTrigger
                            className="pl-4 w-full text-left"
                            onClick={() => handleProjectSelect(project)}
                          >
                            {project.project_name}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="min-w-[200px]">
                            {tasks[project.project_id] ? (
                              tasks[project.project_id].length > 0 ? (
                                tasks[project.project_id].map((task) => (
                                  <DropdownMenuItem
                                    key={task.task_id}
                                    onClick={() =>
                                      handleTaskSelect(project, task)
                                    }
                                  >
                                    {task.task_name}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <div className="py-2 px-3 text-gray-500">
                                  No tasks available
                                </div>
                              )
                            ) : (
                              <div className="py-2 px-3 text-gray-500">
                                Loading tasks...
                              </div>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ))}
                    </div>
                  )
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {validationErrors.project && showErrors && (
            <div className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {validationErrors.project}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="time"
            value={startTime}
            onChange={handleStartTimeChange}
            className={`w-[100px] ${
              validationErrors.time && showErrors
                ? "border-red-500 focus:ring-red-500"
                : ""
            }`}
          />

          <span className="text-gray-400">-</span>

          <Input
            type="time"
            value={endTime}
            onChange={handleEndTimeChange}
            className={`w-[100px] ${
              validationErrors.time && showErrors
                ? "border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
        </div>

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
              {format(selectedDate, "MM/dd/yy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAddEntry}
        >
          Add
        </Button>

        <Button variant="ghost" size="icon">
          <Clock className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {validationErrors.time && showErrors && (
        <div className="text-red-500 text-xs mt-2 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {validationErrors.time}
        </div>
      )}
    </div>
  );
};

export default TimeEntryForm;
