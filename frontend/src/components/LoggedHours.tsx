import { Button } from "@/components/ui/button";
import { Copy, Trash2, Settings, Folder } from "lucide-react";

interface LoggedHoursDisplayProps {
  // You can add props as needed, such as entries, total hours, etc.
  entries?: any[]; // Replace with your actual entry type
}

const LoggedHoursDisplay = ({ entries = [] }: LoggedHoursDisplayProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-600 mr-[560px]">
            Today's logged hours : <strong>08:00 hrs</strong>
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <Copy className="h-4 w-4" />
              </div>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <Trash2 className="h-4 w-4" />
              </div>
            </Button>
            <Button variant="outline" className="text-gray-500">
              Select
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1 text-gray-500"
            >
              <Settings className="h-4 w-4" />
              Customise
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4">
        {entries.length === 0 ? (
          <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center">
            <Folder className="h-16 w-16 text-gray-300 mb-4" />
            <p className="font-medium mb-1">No entries added yet</p>
            <p className="text-sm text-gray-500">
              You can add the entries from
              <br />
              the action card or add a project to start.
            </p>
          </div>
        ) : (
          // Map through entries and display them
          entries.map((entry) => (
            <div key={entry.id} className="border rounded-md p-4">
              {/* Entry details would go here */}
              {/* This is a placeholder and should be updated based on your entry structure */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoggedHoursDisplay;
