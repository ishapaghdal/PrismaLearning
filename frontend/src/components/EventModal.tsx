"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TimeEntryData } from "@/types/event";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: TimeEntryData) => void;
  onUpdate: (event: TimeEntryData) => void;
  onDelete: (id: string) => void;
  event: TimeEntryData | null;
  isNewEvent?: boolean;
}

// Added these interfaces for the project and task data structures
interface Project {
  project_id: string;
  project_name: string;
  project_type: string;
}

interface Task {
  task_id: string;
  task_name: string;
}

export default function EventModal({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  event,
  isNewEvent = false,
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState("#ffebee");
  const [isShadowEvent, setIsShadowEvent] = useState(false);
  const [googleEventId, setGoogleEventId] = useState<string | undefined>();

  // Added state for projects and tasks
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{project?: string}>({});
  const [showErrors, setShowErrors] = useState(false);
  const EMPLOYEE_ID = "605c5c469b9a512b4b59a22d"; // This should be dynamic in a real app

  // Group projects by type for the dropdown
  const groupedProjects = projects.reduce<Record<string, Project[]>>((acc, project) => {
    const type = project.project_type || "Other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(project);
    return acc;
  }, {});

  // Get color for project type in the dropdown
  const getProjectTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      Internal: "blue",
      Client: "green",
      Other: "gray",
    };
    return colorMap[type] || "gray";
  };

  // Function to fetch projects from the backend
  const fetchProjectsByEmployeeId = async (employeeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/employee-projects/${employeeId}`,
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
        err instanceof Error ? err.message : "Error fetching projects by employee ID"
      );
      setLoading(false);
    }
  };

  // Function to fetch tasks for a project
  const fetchTasksByProjectId = async (projectId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/project-tasks/${projectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks for project ${projectId}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setTasks(prev => ({
          ...prev,
          [projectId]: data.data
        }));
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Handle project selection
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedTask(null);
    
    // Fetch tasks for this project if we haven't already
    if (!tasks[project.project_id]) {
      fetchTasksByProjectId(project.project_id);
    }
    
    // Clear validation errors for project
    if (validationErrors.project) {
      setValidationErrors(prev => ({ ...prev, project: undefined }));
    }
  };

  // Handle task selection
  const handleTaskSelect = (project: Project, task: Task) => {
    setSelectedProject(project);
    setSelectedTask(task);
    setDropdownOpen(false);
  };

  // Function to render the value in the project selector button
  const renderProjectSelectorValue = () => {
    if (selectedProject) {
      return selectedProject.project_name;
    }
    return "Select a project";
  };

  useEffect(() => {
    // Fetch projects when component mounts
    fetchProjectsByEmployeeId(EMPLOYEE_ID);
  }, []);

  useEffect(() => {
    if (event) {
      // Use the existing event data
      const start = new Date(event.startTime);
      const end = event.endTime
        ? new Date(event.endTime)
        : new Date(start.getTime() + 60 * 60 * 1000);

      setTitle(event.title || event.description || "");
      setStartDate(formatDateForInput(start));
      setStartTime(formatTimeForInput(start));
      setEndDate(formatDateForInput(end));
      setEndTime(formatTimeForInput(end));
      setColor(event.backgroundColor || "#ffebee");
      setIsShadowEvent(event.isShadow || false);
      setGoogleEventId(event.extendedProps?.googleEventId);
      
      // Find and set the selected project if it exists in the projects list
      if (event.projectId) {
        const project = projects.find(p => p.project_id === event.projectId);
        if (project) {
          setSelectedProject(project);
          
          // Load tasks for this project if not already loaded
          if (!tasks[project.project_id]) {
            fetchTasksByProjectId(project.project_id);
          }
          
          // Find and set the selected task if it exists in the tasks list
          if (event.taskId && tasks[project.project_id]) {
            const task = tasks[project.project_id].find(t => t.task_id === event.taskId);
            if (task) {
              setSelectedTask(task);
            }
          }
        }
      }
    } else {
      // Create a new event with default values
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      setTitle("New Event");
      setStartDate(formatDateForInput(now));
      setStartTime(formatTimeForInput(now));
      setEndDate(formatDateForInput(now));
      setEndTime(formatTimeForInput(oneHourLater));
      setColor("#ffebee");
      setIsShadowEvent(false);
      setGoogleEventId(undefined);
      setSelectedProject(null);
      setSelectedTask(null);
    }
  }, [event, projects]);

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSubmit = () => {
    // Validate required fields
    const errors: {project?: string} = {};
    
    if (!selectedProject) {
      errors.project = "Project is required";
    }
    
    setValidationErrors(errors);
    setShowErrors(true);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const newEvent: TimeEntryData = {
      id: event?.id || crypto.randomUUID(),
      startTime: startDateTime,
      endTime: endDateTime,
      backgroundColor: color,
      borderColor: color,
      textColor: getContrastColor(color),
      description: title,
      projectId: selectedProject?.project_id || "default-project",
      projectName: selectedProject?.project_name || "Default Project",
      taskId: selectedTask?.task_id,
      taskName: selectedTask?.task_name,
      title: title,
      date: startDateTime,
      createdAt: new Date(),
      isShadow: false, // Always set to false when saving
      extendedProps: {
        description: title,
        projectId: selectedProject?.project_id || "default-project",
        projectName: selectedProject?.project_name || "Default Project",
        taskId: selectedTask?.task_id,
        taskName: selectedTask?.task_name,
        isShadow: false,
        googleEventId: googleEventId, // Preserve the Google Calendar event ID if it exists
      },
    };

    if (isNewEvent) {
      onAdd(newEvent);
    } else {
      onUpdate(newEvent);
    }
    
    onClose();
  };

  const getContrastColor = (hexColor: string) => {
    const r = Number.parseInt(hexColor.slice(1, 3), 16);
    const g = Number.parseInt(hexColor.slice(3, 5), 16);
    const b = Number.parseInt(hexColor.slice(5, 7), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const colorOptions = [
    { bg: "#ffebee", label: "Red" },
    { bg: "#e3f2fd", label: "Blue" },
    { bg: "#f1f8e9", label: "Green" },
    { bg: "#fff8e1", label: "Yellow" },
    { bg: "#f3e5f5", label: "Purple" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isNewEvent 
              ? isShadowEvent 
                ? "Convert Google Calendar Event" 
                : "Add Event"
              : "Edit Event"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Project Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="project">Project</Label>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`w-full justify-between text-left font-normal overflow-hidden text-ellipsis whitespace-nowrap ${ validationErrors.project && showErrors ? "border-red-500 focus:ring-red-500" : "" }`} >
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
                          <div className={`h-2 w-2 rounded-full bg-${getProjectTypeColor(groupName)}-500 mr-2`}></div>
                          <span className="font-medium">{groupName}</span>
                        </div>

                        {groupProjects.map((project) => (
                          <DropdownMenuSub key={project.project_id}>
                            <DropdownMenuSubTrigger className="pl-4 w-full text-left" onClick={() => handleProjectSelect(project)}>
                              {project.project_name}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="min-w-[200px]">
                              {tasks[project.project_id] ? (
                                tasks[project.project_id].length > 0 ? (
                                  tasks[project.project_id].map((task) => (
                                    <DropdownMenuItem key={task.task_id} onClick={() => handleTaskSelect(project, task)}>
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
          
          {/* Selected Task Display */}
          {selectedTask && (
            <div className="grid gap-2">
              <Label>Selected Task</Label>
              <div className="px-3 py-2 border rounded-md bg-gray-50">
                {selectedTask.task_name}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colorOptions.map((option) => (
                <div
                  key={option.bg}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    color === option.bg ? "border-black" : "border-transparent"
                  }`}
                  style={{ backgroundColor: option.bg }}
                  onClick={() => setColor(option.bg)}
                  title={option.label}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          {!isNewEvent && event && (
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(event.id);
                onClose();
              }}
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isNewEvent 
              ? isShadowEvent 
                ? "Convert to Real Event" 
                : "Add"
              : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}