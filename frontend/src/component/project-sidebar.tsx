import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectGroup = {
  id: string;
  name: string;
  tasks: string[];
  isOpen?: boolean;
};

export default function ProjectSidebar() {
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([
    {
      id: "1",
      name: "2025 Internship",
      tasks: [
        "Exercise",
        "Taking notes",
        "Meeting",
        "Self learning",
        "Assessment test",
        "Leadership tasks",
      ],
      isOpen: true,
    },
    {
      id: "2",
      name: "Time Companion - Internship",
      tasks: [],
      isOpen: false,
    },
    {
      id: "3",
      name: "Autogine Internal",
      tasks: [],
      isOpen: false,
    },
  ]);

  const toggleGroup = (id: string) => {
    setProjectGroups(
      projectGroups.map((group) =>
        group.id === id ? { ...group, isOpen: !group.isOpen } : group
      )
    );
  };

  return (
    <div className="w-64 border-r bg-white flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-700">Project tasks</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {projectGroups.map((group) => (
          <div key={group.id} className="border-b">
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center">
                {group.isOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span className="ml-2 text-sm font-medium">{group.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {group.id === "1" && "active tasks"}
              </div>
            </div>

            {group.isOpen && (
              <div className="pl-8 pr-3 pb-2">
                {group.tasks.map((task, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between py-2 px-2 text-sm rounded-md",
                      index === 2 ? "bg-gray-100" : ""
                    )}
                  >
                    <span>{task}</span>
                    <span className="text-gray-400">
                      {index < 3 ? "8" : "0"}
                    </span>
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
