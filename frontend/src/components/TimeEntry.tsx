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
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Folder,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Settings,
  Copy,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TimeEntry = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endTime, setEndTime] = useState<string>("10:10");
  const [task, setTask] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [timerValue, setTimerValue] = useState<string>("00:00:00");

  // Mock data for the week days
  const weekDays = ["M", "T", "W", "T", "F"];
  const currentDayIndex = 3; // Thursday is highlighted in the image

  // Calculate time difference when startTime or endTime changes
  useEffect(() => {
    calculateTimeDifference();
  }, [startTime, endTime]);

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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-xl font-semibold mb-4">Logged Hours</h1>

          {/* Time entry form */}
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
                        {project.startsWith("research") ||
                        project.startsWith("meetings") ||
                        project.startsWith("leadership") ||
                        project.startsWith("design")
                          ? "Regio: "
                          : project.startsWith("raapid")
                            ? "RAAPID: "
                            : project.startsWith("tc")
                              ? "Time Companion: "
                              : ""}
                        {project === "research"
                          ? "Research"
                          : project === "meetings"
                            ? "Meetings"
                            : project === "leadership"
                              ? "Leadership task"
                              : project === "design"
                                ? "Design"
                                : project === "raapid-task1"
                                  ? "Task 1"
                                  : project === "raapid-task2"
                                    ? "Task 2"
                                    : project === "tc-task1"
                                      ? "Task 1"
                                      : project === "tc-task2"
                                        ? "Task 2"
                                        : ""}
                      </>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {/* Regio Project Group */}
                  <div className="py-2">
                    <div className="flex items-center px-2 pb-1">
                      <span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
                      <span className="font-medium">Regio</span>
                    </div>
                    <SelectItem value="research" className="pl-4">
                      Research
                    </SelectItem>
                    <SelectItem value="meetings" className="pl-4">
                      Meetings
                    </SelectItem>
                    <SelectItem value="leadership" className="pl-4">
                      Leadership task
                    </SelectItem>
                    <SelectItem value="design" className="pl-4">
                      Design
                    </SelectItem>
                  </div>

                  {/* RAAPID Project Group */}
                  <div className="py-2 border-t">
                    <div className="flex items-center px-2 pb-1 pt-1">
                      <span className="h-2 w-2 rounded-full bg-pink-500 mr-2"></span>
                      <span className="font-medium">RAAPID</span>
                    </div>
                    <SelectItem value="raapid-task1" className="pl-4">
                      Task 1
                    </SelectItem>
                    <SelectItem value="raapid-task2" className="pl-4">
                      Task 2
                    </SelectItem>
                  </div>

                  {/* Time Companion Project Group */}
                  <div className="py-2 border-t">
                    <div className="flex items-center px-2 pb-1 pt-1">
                      <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                      <span className="font-medium">Time Companion</span>
                    </div>
                    <SelectItem value="tc-task1" className="pl-4">
                      Task 1
                    </SelectItem>
                    <SelectItem value="tc-task2" className="pl-4">
                      Task 2
                    </SelectItem>
                  </div>
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

          {/* Progress section */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="font-medium">Day 24</span>
                <div className="w-4 h-4 bg-orange-500 rounded-full ml-1"></div>
              </div>
              <span className="text-gray-500">40%</span>
            </div>
            <Progress value={40} className="h-2 bg-gray-200" />

            <div className="flex justify-between items-center mt-6">
              <span className="font-medium">This week</span>

              <div className="flex items-center space-x-2">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      index === currentDayIndex
                        ? "bg-blue-600 text-white"
                        : "text-gray-500"
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <span className="text-sm">Today, 12th March, 2025</span>
                  <CalendarIcon className="h-4 w-4" />
                </div>

                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Entries section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-600 mr-[560px]">
                  Today's logged hours : <strong>08:00 hrs</strong>
                </span>
                <div className="flex  gap-2 ">
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
              <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center">
                <Folder className="h-16 w-16 text-gray-300 mb-4" />
                <p className="font-medium mb-1">No entries added yet</p>
                <p className="text-sm text-gray-500">
                  You can add the entries from
                  <br />
                  the action card or add a project to start.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeEntry;
