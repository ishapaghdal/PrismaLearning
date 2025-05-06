export interface TimeEntryData {
  id: string; // This will be auto-generated
  title?: string;
  description: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  startTime: Date;
  endTime: Date;
  duration?: string;
  date: Date;
  createdAt?: Date;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  isShadow?: boolean;
}

// For compatibility with FullCalendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    description: string;
    projectId: string;
    projectName: string;
    taskId?: string;
    taskName?: string;
    duration?: string;
    date?: Date;
    createdAt?: Date;
    isShadow?: boolean;
  };
}

// Google Calendar specific event interface
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  description?: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
}

export interface Task {
  task_id: string;
  project_id: string;
  task_name: string;
}

export interface CalendarViewProps {
  entries: TimeEntryData[];
  projects: Project[];
  tasks: Task[];
}

// Helper function to convert between formats
export function timeEntryToCalendarEvent(entry: TimeEntryData): CalendarEvent {
  return {
    id: entry.id,
    title: entry.title || entry.description || `${entry.projectName} - ${entry.taskName || "Task"}`,
    start: entry.startTime,
    end: entry.endTime,
    backgroundColor: entry.backgroundColor,
    borderColor: entry.borderColor,
    textColor: entry.textColor,
    extendedProps: {
      description: entry.description,
      projectId: entry.projectId,
      projectName: entry.projectName,
      taskId: entry.taskId,
      taskName: entry.taskName,
      duration: calculateDuration(entry.startTime, entry.endTime),
      date: entry.date,
      createdAt: entry.createdAt || new Date(),
      isShadow: entry.isShadow,
    },
  };
}

export function calendarEventToTimeEntry(event: CalendarEvent): TimeEntryData {
  const startTime = typeof event.start === 'string' ? new Date(event.start) : event.start;
  const endTime = typeof event.end === 'string' ? new Date(event.end) : event.end;
  
  return {
    id: event.id,
    title: event.title,
    description: event.extendedProps.description,
    projectId: event.extendedProps.projectId,
    projectName: event.extendedProps.projectName,
    taskId: event.extendedProps.taskId,
    taskName: event.extendedProps.taskName,
    startTime: startTime,
    endTime: endTime,
    duration: event.extendedProps.duration,
    date: event.extendedProps.date || new Date(startTime),
    createdAt: event.extendedProps.createdAt,
    backgroundColor: event.backgroundColor,
    borderColor: event.borderColor,
    textColor: event.textColor,
    isShadow: event.extendedProps.isShadow,
  };
}

// Convert Google Calendar event to our CalendarEvent format
export function googleCalendarToCalendarEvent(event: any): CalendarEvent {
  const color = getRandomColor();
  
  return {
    id: event.id,
    title: event.summary || "No Title",
    start: event.start.dateTime,
    end: event.end.dateTime,
    backgroundColor: color.bg,
    borderColor: color.border,
    textColor: color.text,
    extendedProps: {
      description: event.description || event.summary || "No Description",
      projectId: "google-calendar",
      projectName: "Google Calendar",
      isShadow: true,
      duration: calculateDuration(new Date(event.start.dateTime), new Date(event.end.dateTime)),
      date: new Date(event.start.dateTime),
    },
  };
}

// Utility function to calculate duration between two dates
export function calculateDuration(start: Date | string, end: Date | string): string {
  // Convert to Date objects if strings are provided
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  
  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return "0h 0m"; // Default for invalid dates
  }
  
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

// Random color generator
export function getRandomColor() {
  const colors = [
    { bg: "#ffebee", border: "#ffcdd2", text: "#c62828" }, // Red
    { bg: "#e3f2fd", border: "#bbdefb", text: "#1565c0" }, // Blue
    { bg: "#f1f8e9", border: "#dcedc8", text: "#33691e" }, // Green
    { bg: "#fff8e1", border: "#ffecb3", text: "#ff6f00" }, // Yellow
    { bg: "#f3e5f5", border: "#e1bee7", text: "#6a1b9a" }, // Purple
    { bg: "#e0f7fa", border: "#b2ebf2", text: "#00838f" }, // Cyan
    { bg: "#fbe9e7", border: "#ffccbc", text: "#bf360c" }, // Deep Orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}