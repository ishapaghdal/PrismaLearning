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
import {
  type TimeEntryData,
  type CalendarEvent,
  timeEntryToCalendarEvent,
  calendarEventToTimeEntry,
  googleCalendarToCalendarEvent,
  getRandomColor,
  calculateDuration,
  type CalendarViewProps,
} from "@/types/event";

const CalendarViewNew = ({ entries, projects, tasks }: CalendarViewProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shadowEvents, setShadowEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimeEntryData | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false); // New state to track if it's a new event
  const [view, setView] = useState("timeGridDay");
  const calendarRef = useRef<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state for API operations

  // Initialize Google API client
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
            // Check if user is already signed in
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
              setIsAuthenticated(true);
              fetchCalendarEvents();
            }
          })
          .catch((error) => {
            console.error("Error initializing Google API client:", error);
          });
      });
    };

    if (window.gapi) {
      initClient();
    }
  }, []);

  // Convert and use provided entries
  useEffect(() => {
    if (entries && entries.length > 0) {
      const formattedEvents = entries.map((entry) => timeEntryToCalendarEvent(entry));
      setEvents((prevEvents) => {
        // Filter out any existing entries that might be duplicates
        const filteredEvents = prevEvents.filter(
          (event) => !formattedEvents.some((e) => e.id === event.id)
        );
        return [...filteredEvents, ...formattedEvents];
      });
    }
  }, [entries]);

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

  const fetchCalendarEvents = async () => {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(), // Use current time instead of hardcoded date
        showDeleted: false,
        singleEvents: true,
        maxResults: 20,
        orderBy: "startTime",
      });

      const googleEvents = response.result.items || [];
      console.log("Fetched Google Calendar events:", googleEvents);

      // Convert Google Calendar events to our format
      const calendarEvents = googleEvents.map((event: any) => 
        googleCalendarToCalendarEvent(event)
      );

      // Add these as shadow events
      setShadowEvents(calendarEvents);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
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
      if (!entry.isShadow) {
        try {
          // Calculate duration string if not provided
          const duration = entry.duration || calculateDuration(entry.startTime, entry.endTime);
          
          // Format dates to match API expectations
          const startDate = new Date(entry.startTime);
          const formattedStartTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
          
          const endDate = new Date(entry.endTime);
          const formattedEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
          
          // Format date in yyyy-MM-dd
          const formattedDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
          
          const payload = {
            description: entry.description || entry.title,
            start_time: `${formattedDate}T${formattedStartTime}:00`,
            end_time: `${formattedDate}T${formattedEndTime}:00`,
            duration: duration,
            billable: true, // optional: replace with real logic
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
        } catch (apiError) {
          console.error("Error saving time entry to API:", apiError);
          // Optionally show an error message to the user
        }
      }

      // Convert to calendar event format
      const calendarEvent = timeEntryToCalendarEvent(newEntry);
      
      // Add to our events state
      setEvents((prevEvents) => [...prevEvents, calendarEvent]);
      
      // If the user is authenticated with Google, also add to Google Calendar
      if (isAuthenticated && gapi.client && !entry.isShadow) {
        await gapi.client.calendar.events.insert({
          calendarId: "primary",
          sendUpdates: "all",
          resource: {
            summary: newEntry.title || newEntry.description,
            description: newEntry.description,
            start: {
              dateTime: newEntry.startTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: newEntry.endTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        });
        console.log("✅ Successfully added to Google Calendar");
        
        // Refresh Google Calendar events
        fetchCalendarEvents();
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleEventClick = (info: any) => {
    const event = info.event;
    
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
          ...event.extendedProps,
          isShadow: false, // Mark as no longer a shadow event
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

      // Update the entry in the backend if it's not a shadow entry
      if (!entry.isShadow) {
        try {
          // Calculate duration string if not provided
          const duration = entry.duration || calculateDuration(entry.startTime, entry.endTime);
          
          // Format dates to match API expectations
          const startDate = new Date(entry.startTime);
          const formattedStartTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
          
          const endDate = new Date(entry.endTime);
          const formattedEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
          
          // Format date in yyyy-MM-dd
          const formattedDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
          
          const payload = {
            description: entry.description || entry.title,
            start_time: `${formattedDate}T${formattedStartTime}:00`,
            end_time: `${formattedDate}T${formattedEndTime}:00`,
            duration: duration,
            billable: true, // optional: replace with real logic
            project_id: entry.projectId || "default-project",
            task_id: entry.taskId || null,
          };

          // Assuming your API has an update endpoint
          const response = await fetch(`http://localhost:3000/api/time-entry/${entry.id}`, {
            method: "PUT", // Use PATCH if your API supports partial updates
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error("Failed to update time entry");
          }

          const result = await response.json();
          console.log("✅ Successfully updated in database:", result);
        } catch (apiError) {
          console.error("Error updating time entry in API:", apiError);
          // Optionally show an error message to the user
        }
      }

      // Convert to calendar event format
      const calendarEvent = timeEntryToCalendarEvent(updatedEntry);
      
      // Update in our events state
      setEvents((prevEvents) => 
        prevEvents.map((e) => e.id === calendarEvent.id ? calendarEvent : e)
      );
      
      // If the user is authenticated with Google, we could also update the Google Calendar event here
      // This would require storing the Google Calendar event ID with our entry and using it for updates
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      // Find the event to check if it's a shadow event
      const eventToDelete = events.find(e => e.id === id);
      
      if (eventToDelete && !eventToDelete.extendedProps.isShadow) {
        // If it's not a shadow event, delete from the backend
        try {
          const response = await fetch(`http://localhost:3000/api/time-entry/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to delete time entry");
          }
          
          console.log("✅ Successfully deleted from database");
        } catch (apiError) {
          console.error("Error deleting time entry in API:", apiError);
          // Optionally show an error message to the user
        }
      }
      
      // Remove from our events state
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== id));
      
      // If the user is authenticated with Google and this was originally from Google Calendar
      // we could also delete the Google Calendar event here if we tracked the Google Calendar event ID
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSelect = (info: any) => {
    // When time range is selected, create default event within that range
    const color = getRandomColor();
    const defaultEvent: TimeEntryData = {
      id: crypto.randomUUID(),
      startTime: info.start,
      endTime: info.end,
      description: "New Event",
      title: "New Event",
      projectId: "default-project",
      projectName: "Default Project",
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

  const handleDateClick = (arg: any) => {
    // When a specific date/time is clicked, create a default 1-hour event
    const startTime = arg.date;
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const color = getRandomColor();
    
    const defaultEvent: TimeEntryData = {
      id: crypto.randomUUID(),
      startTime: startTime,
      endTime: endTime,
      description: "New Event",
      title: "New Event",
      projectId: "default-project",
      projectName: "Default Project",
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
    const fullCalendarView = viewType === "day" ? "timeGridDay" : "timeGridWeek";
    setView(fullCalendarView);
    
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(fullCalendarView);
    }
  };

  return (
    <>
      <Button 
        onClick={handleLogin} 
        disabled={isAuthenticated}
      >
        {isAuthenticated ? "Connected to Google Calendar" : "Sign in with Google Calendar"}
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
              eventResize={(info) => handleEventClick(info)}
              eventClick={handleEventClick}
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
                    <div className="text-xs">
                      {arg.timeText}
                    </div>
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
              isNewEvent={isNewEvent} // Pass the isNewEvent flag to the modal
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CalendarViewNew;