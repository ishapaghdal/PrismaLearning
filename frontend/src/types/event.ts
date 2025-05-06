export interface TimeEntryData {
  id: string; // This will be auto-generated
  title? : string;
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
  start: {
    dateTime: Date,
    timeZone: string,
  },
  end: {
    dateTime:Date,
    timeZone : string,
  }
  // start: string;
  // end: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    description: string;
    projectId: string;
    projectName: string;
    taskId?: string;
    taskName?: string;
    duration: string;
    date: Date;
    createdAt?: Date;
    isShadow?: boolean;
  },
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
    title:
      entry.description || `${entry.projectName} - ${entry.taskName || "Task"}`,
    start:{ dateTime : entry.startTime, timeZone : 'UTC'},
    end:{ dateTime : entry.endTime, timeZone : 'UTC'},
    backgroundColor: entry.backgroundColor,
    borderColor: entry.borderColor,
    textColor: entry.textColor,
    extendedProps: {
      description: entry.description,
      projectId: entry.projectId,
      projectName: entry.projectName,
      taskId: entry.taskId,
      taskName: entry.taskName,
      duration: entry.duration,
      date: entry.date,
      createdAt: entry.createdAt,
      isShadow: entry.isShadow,
    },
  };
}

export function calendarEventToTimeEntry(event: CalendarEvent): TimeEntryData {
  return {
    id: event.id,
    description: event.extendedProps.description,
    projectId: event.extendedProps.projectId,
    projectName: event.extendedProps.projectName,
    taskId: event.extendedProps.taskId,
    taskName: event.extendedProps.taskName,
    startTime: event.start.dateTime,
    endTime: event.end.dateTime,
    duration: event.extendedProps.duration,
    date: event.extendedProps.date,
    createdAt: event.extendedProps.createdAt,
    backgroundColor: event.backgroundColor,
    borderColor: event.borderColor,
    textColor: event.textColor,
    isShadow: event.extendedProps.isShadow,
  };
}
