import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import EventModal from "./EventModal";
import { gapi } from "gapi-script";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar";
const EMPLOYEE_ID = "605c5c469b9a512b4b59a22d";

import {
  type TimeEntryData,
  type CalendarEvent,
  timeEntryToCalendarEvent,
  calendarEventToTimeEntry,
  googleCalendarToCalendarEvent,
  getRandomColor,
  calculateDuration,
} from "@/types/event";

interface TimeEntryResponse {
  time_entry_id: string;
  description: string;
  project_id: string;
  Project?: {
    project_name: string;
  };
  task_id?: string;
  Task?: {
    task_name: string;
  };
  start_time: string;
  end_time: string;
  duration: string;
  created_ts: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
}

interface EventClickInfo {
  event: {
    id: string;
    title: string;
    start: Date | null;
    end: Date | null;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
      description: string;
      projectId: string;
      projectName: string;
      taskId?: string;
      taskName?: string;
      duration?: string;
      date?: Date;
      createdAt?: Date;
      isShadow: boolean;
      googleEventId?: string;
    };
  };
}

interface SelectInfo {
  start: Date;
  end: Date;
}

interface DateClickInfo {
  date: Date;
}

// Add type declaration for window.gapi
declare global {
  interface Window {
    gapi: typeof gapi;
  }
}

const CalendarViewNew = ({ projects, tasks, entries }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shadowEvents, setShadowEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimeEntryData | null>(
    null
  );
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [view, setView] = useState("timeGridDay");
  const calendarRef = useRef<FullCalendar>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch entries from the backend
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/time-entry?employee_id=${EMPLOYEE_ID}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch time entries");
      }

      const data = await response.json();
      console.log("Fetched time entries from backend:", data);

      const formatted = data.map((entry: TimeEntryResponse) => ({
        id: entry.time_entry_id,
        description: entry.description,
        projectId: entry.project_id,
        projectName: entry.Project?.project_name || "Unnamed Project",
        taskId: entry.task_id,
        taskName: entry.Task?.task_name || "",
        startTime: new Date(entry.start_time),
        endTime: new Date(entry.end_time),
        duration: entry.duration,
        date: new Date(entry.start_time),
        createdAt: new Date(entry.created_ts),
      }));

      // Convert to calendar events
      const calendarEvents = formatted.map((entry: TimeEntryData) =>
        timeEntryToCalendarEvent(entry)
      );
      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching time entries from backend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Google API client and fetch entries
  useEffect(() => {
    const initClient = () => {
      gapi.load("client:auth2", () => {
        gapi.client
          .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
            scope: SCOPES,
          })
          .then(() => {
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
              setIsAuthenticated(true);
              fetchCalendarEvents();
            }
          })
          .catch((error: Error) => {
            console.error("Error initializing Google API client:", error);
          });
      });
    };

    if (typeof window !== "undefined" && window.gapi) {
      initClient();
    }

    // Fetch entries when component mounts
    fetchEntries();
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 20,
        orderBy: "startTime",
      });

      const googleEvents = response.result.items || [];
      console.log("Fetched Google Calendar events:", googleEvents);

      // Convert Google Calendar events to our format
      const calendarEvents = googleEvents
        .map((event: GoogleCalendarEvent) => ({
          ...googleCalendarToCalendarEvent(event),
          extendedProps: {
            ...googleCalendarToCalendarEvent(event).extendedProps,
            googleEventId: event.id, // Store the Google Calendar event ID
          },
        }))
        .filter((event: CalendarEvent) => {
          // Check if this event already exists in our database
          const startTime = new Date(event.start);
          const endTime = new Date(event.end);

          // Check if there's an existing event with the same time range
          return !events.some((existingEvent) => {
            const existingStart = new Date(existingEvent.start);
            const existingEnd = new Date(existingEvent.end);

            return (
              startTime.getTime() === existingStart.getTime() &&
              endTime.getTime() === existingEnd.getTime() &&
              event.title === existingEvent.title
            );
          });
        });

      // Add these as shadow events
      setShadowEvents(calendarEvents);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
    }
  };

  const handleEventClick = (info: EventClickInfo) => {
    const event = info.event;
    if (!event.start || !event.end) return;

    // Check if this is a shadow event from Google Calendar
    if (event.extendedProps.isShadow) {
      // Convert shadow to a real event by opening the modal with its data
      const timeEntry = calendarEventToTimeEntry({
        id: crypto.randomUUID(), // Generate new ID for the real event
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        textColor: event.textColor,
        extendedProps: {
          description: event.title,
          projectId: "default-project",
          projectName: "Default Project",
          isShadow: false,
          googleEventId: event.extendedProps.googleEventId, // Preserve the Google Calendar event ID
        },
      });

      // For shadow events from Google Calendar, we treat them as new events
      // that will need to be saved to our database
      setSelectedEvent(timeEntry);
      setIsNewEvent(true); // Treat conversions from shadow events as new events
      setIsModalOpen(true);
    } else {
      // For regular events, just open the edit modal
      const timeEntry = calendarEventToTimeEntry({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        textColor: event.textColor,
        extendedProps: event.extendedProps,
      });

      setSelectedEvent(timeEntry);
      setIsNewEvent(false); // This is an existing event
      setIsModalOpen(true);
    }
  };

  const handleLogin = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsAuthenticated(true);
      fetchCalendarEvents();
    } catch (error) {
      console.error("Google Sign-In failed:", error);
    }
  };

  const handleAddEntry = async (entry: TimeEntryData) => {
    try {
      // Ensure the entry has an ID
      const newEntry = {
        ...entry,
        id: entry.id || crypto.randomUUID(),
        isShadow: false,
      };

      // Make sure colors are set
      if (!newEntry.backgroundColor) {
        const color = getRandomColor();
        newEntry.backgroundColor = color.bg;
        newEntry.borderColor = color.border;
        newEntry.textColor = color.text;
      }

      // Save entry to backend
      try {
        // Calculate duration string if not provided
        const duration =
          entry.duration || calculateDuration(entry.startTime, entry.endTime);

        // Format dates to match API expectations
        const startDate = new Date(entry.startTime);
        const formattedStartTime = `${startDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${startDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const endDate = new Date(entry.endTime);
        const formattedEndTime = `${endDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${endDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        // Format date in yyyy-MM-dd
        const formattedDate = `${startDate.getFullYear()}-${(
          startDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${startDate
          .getDate()
          .toString()
          .padStart(2, "0")}`;

        const payload = {
          description: entry.description || entry.title,
          start_time: `${formattedDate}T${formattedStartTime}:00`,
          end_time: `${formattedDate}T${formattedEndTime}:00`,
          duration: duration,
          billable: true,
          project_id: entry.projectId || "default-project",
          task_id: entry.taskId || null,
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

        const result = await response.json();
        console.log("✅ Successfully saved to database:", result);

        // Update the ID if the backend generated a new one
        if (result.id) {
          newEntry.id = result.id;
        }

        console.log(entry);
        

        // If this was a shadow event, remove it from shadow events
        if (entry.extendedProps?.googleEventId) {
          setShadowEvents((prev) =>
            prev.filter(
              (e) =>
                e.extendedProps.googleEventId !==
                entry.extendedProps.googleEventId
            )
          );
        }
      } catch (apiError) {
        console.error("Error saving time entry to API:", apiError);
      }

      // Convert to calendar event format
      const calendarEvent = timeEntryToCalendarEvent(newEntry);

      // Add to our events state
      setEvents((prevEvents) => [...prevEvents, calendarEvent]);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleUpdateEvent = async (entry: TimeEntryData) => {
    try {
      // Ensure the entry has consistent properties
      const updatedEntry = {
        ...entry,
        isShadow: false,
      };

      // Make sure colors are set
      if (!updatedEntry.backgroundColor) {
        const color = getRandomColor();
        updatedEntry.backgroundColor = color.bg;
        updatedEntry.borderColor = color.border;
        updatedEntry.textColor = color.text;
      }

      // Update the entry in the backend
      try {
        // Calculate duration string if not provided
        const duration =
          entry.duration || calculateDuration(entry.startTime, entry.endTime);

        // Format dates to match API expectations
        const startDate = new Date(entry.startTime);
        const formattedStartTime = `${startDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${startDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const endDate = new Date(entry.endTime);
        const formattedEndTime = `${endDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${endDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        // Format date in yyyy-MM-dd
        const formattedDate = `${startDate.getFullYear()}-${(
          startDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${startDate
          .getDate()
          .toString()
          .padStart(2, "0")}`;

        const payload = {
          description: entry.description || entry.title,
          start_time: `${formattedDate}T${formattedStartTime}:00`,
          end_time: `${formattedDate}T${formattedEndTime}:00`,
          duration: duration,
          billable: true,
          project_id: entry.projectId || "default-project",
          task_id: entry.taskId || null,
        };

        const response = await fetch(
          `http://localhost:3000/api/time-entry/${entry.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update time entry");
        }

        const result = await response.json();
        console.log("✅ Successfully updated in database:", result);
      } catch (apiError) {
        console.error("Error updating time entry in API:", apiError);
      }

      // Convert to calendar event format
      const calendarEvent = timeEntryToCalendarEvent(updatedEntry);

      // Update in our events state
      setEvents((prevEvents) =>
        prevEvents.map((e) => (e.id === calendarEvent.id ? calendarEvent : e))
      );
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      // Find the event to check if it's a shadow event
      const eventToDelete = events.find((e) => e.id === id);

      if (eventToDelete && !eventToDelete.extendedProps.isShadow) {
        // If it's not a shadow event, delete from the backend
        try {
          const response = await fetch(
            `http://localhost:3000/api/time-entry/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete time entry");
          }

          console.log("✅ Successfully deleted from database");
        } catch (apiError) {
          console.error("Error deleting time entry in API:", apiError);
        }
      }

      // Remove from our events state
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSelect = (info: SelectInfo) => {
    // When time range is selected, create default event within that range
    const color = getRandomColor();

    // Fetch first project as default if available
    const defaultProjectId =
      projects.length > 0 ? projects[0].project_id : "default-project";
    const defaultProjectName =
      projects.length > 0 ? projects[0].project_name : "Default Project";

    const defaultEvent: TimeEntryData = {
      id: crypto.randomUUID(),
      startTime: info.start,
      endTime: info.end,
      description: "New Event",
      title: "New Event",
      projectId: defaultProjectId,
      projectName: defaultProjectName,
      date: info.start,
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: color.text,
      isShadow: false,
      duration: calculateDuration(info.start, info.end),
    };

    setSelectedEvent(defaultEvent);
    setIsNewEvent(true); // This is a new event
    setIsModalOpen(true);
  };

  const handleDateClick = (arg: DateClickInfo) => {
    // When a specific date/time is clicked, create a default 1-hour event
    const startTime = arg.date;
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const color = getRandomColor();

    // Fetch first project as default if available
    const defaultProjectId =
      projects.length > 0 ? projects[0].project_id : "default-project";
    const defaultProjectName =
      projects.length > 0 ? projects[0].project_name : "Default Project";

    const defaultEvent: TimeEntryData = {
      id: crypto.randomUUID(),
      startTime: startTime,
      endTime: endTime,
      description: "New Event",
      title: "New Event",
      projectId: defaultProjectId,
      projectName: defaultProjectName,
      date: startTime,
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: color.text,
      isShadow: false,
      duration: calculateDuration(startTime, endTime),
    };

    setSelectedEvent(defaultEvent);
    setIsNewEvent(true); // This is a new event
    setIsModalOpen(true);
  };

  const handleViewChange = (viewType: string) => {
    const fullCalendarView =
      viewType === "day" ? "timeGridDay" : "timeGridWeek";
    setView(fullCalendarView);

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(fullCalendarView);
    }
  };

  // Add loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Button onClick={handleLogin} disabled={isAuthenticated}>
        {isAuthenticated
          ? "Connected to Google Calendar"
          : "Sign in with Google Calendar"}
      </Button>

      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b">
            <Button
              variant="outline"
              onClick={() => handleViewChange("day")}
              className={view === "timeGridDay" ? "bg-blue-100" : ""}
            >
              Day
            </Button>
            <Button
              variant="outline"
              onClick={() => handleViewChange("week")}
              className={view === "timeGridWeek" ? "bg-blue-100" : ""}
            >
              Week
            </Button>
            <Button variant="outline" className="ml-auto">
              Customize
            </Button>
          </div>

          <div className="flex-1 p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridDay"
              headerToolbar={{
                left: "today prev,next",
                center: "title",
                right: "",
              }}
              nowIndicator={true}
              eventTextColor="black"
              slotMinTime="00:00:00"
              slotMaxTime="23:59:59"
              selectable={true}
              editable={true}
              eventResizableFromStart={true}
              allDaySlot={false}
              height="100%"
              events={[...events, ...shadowEvents]}
              dateClick={handleDateClick}
              eventResize={(info) => {
                const event = info.event;
                if (!event.start || !event.end) return;

                handleEventClick({
                  event: {
                    id: event.id,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    backgroundColor: event.backgroundColor || "",
                    borderColor: event.borderColor || "",
                    textColor: event.textColor || "",
                    extendedProps: {
                      description: event.title,
                      projectId: "default-project",
                      projectName: "Default Project",
                      isShadow: false,
                      ...event.extendedProps,
                    },
                  },
                });
              }}
              eventClick={(arg) => {
                const event = arg.event;
                if (!event.start || !event.end) return;

                handleEventClick({
                  event: {
                    id: event.id,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    backgroundColor: event.backgroundColor || "",
                    borderColor: event.borderColor || "",
                    textColor: event.textColor || "",
                    extendedProps: {
                      description: event.title,
                      projectId: "default-project",
                      projectName: "Default Project",
                      isShadow: false,
                      ...event.extendedProps,
                    },
                  },
                });
              }}
              select={handleSelect}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
                hour12: false,
              }}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
                hour12: false,
              }}
              dayHeaderFormat={{
                weekday: "short",
                month: "short",
                day: "numeric",
                omitCommas: true,
              }}
              eventClassNames={(arg) => {
                return arg.event.extendedProps.isShadow ? "shadow-event" : "";
              }}
              eventContent={(arg) => {
                return (
                  <div className="p-1">
                    <div className="font-semibold">{arg.event.title}</div>
                    <div className="text-xs">{arg.timeText}</div>
                  </div>
                );
              }}
            />
          </div>

          {isModalOpen && (
            <EventModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedEvent(null);
                setIsNewEvent(false);
              }}
              onAdd={handleAddEntry}
              onUpdate={handleUpdateEvent}
              onDelete={handleDeleteEvent}
              event={selectedEvent}
              isNewEvent={isNewEvent}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CalendarViewNew;
