import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = "http://localhost:3000/api";

interface Project {
  project_id: string;
  project_name: string;
  type: string;
  color?: string;
  isOpen: boolean;
}

interface Task {
  task_id: string;
  project_id: string;
  task_name: string;
}

export default function ProjectSidebar() {
  // const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([
  //   {
  //     id: "1",
  //     name: "2025 Internship",
  //     tasks: [
  //       "Exercise",
  //       "Taking notes",
  //       "Meeting",
  //       "Self learning",
  //       "Assessment test",
  //       "Leadership tasks",
  //     ],
  //     isOpen: true,
  //   },
  //   {
  //     id: "2",
  //     name: "Time Companion - Internship",
  //     tasks: [],
  //     isOpen: false,
  //   },
  //   {
  //     id: "3",
  //     name: "Autogine Internal",
  //     tasks: [],
  //     isOpen: false,
  //   },
  // ]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach((project) => {
        fetchTasksForProject(project.project_id);
      });
    }
  }, [projects]);

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

  const toggleGroup = (id: string) => {
    setProjects(
      projects.map((group) =>
        group.project_id === id ? { ...group, isOpen: !group.isOpen } : group
      )
    );
  };

  return (
    <div className="w-88 border-r h-screen sticky top-0 bg-white  flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-700">Project tasks</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {projects.map((group) => (
          <div key={group.project_id} className="border-b">
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleGroup(group.project_id)}
            >
              <div className="flex items-center">
                {group.isOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span className="ml-2 text-sm font-medium">
                  {group.project_name}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {group.project_id === "1" && "active tasks"}
              </div>
            </div>

            {group.isOpen && (
              <div className="pl-8 pr-3 pb-2">
                {tasks[group.project_id]?.map((task, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between py-2 px-2 text-sm rounded-md hover:bg-gray-200 hover:cursor-pointer"
                    )}
                  >
                    <span>{task.task_name}</span>
                    <span className="text-gray-400">0</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
