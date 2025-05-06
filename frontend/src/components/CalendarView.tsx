import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import EventModal from "./EventModal";
import type { TimeEntryData as Event } from "@/types/event";
import { gapi } from "gapi-script";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar";
import {
  type TimeEntryData,
  type CalendarEvent,
  timeEntryToCalendarEvent,
  calendarEventToTimeEntry,
} from "@/types/event";

interface CalendarViewProps {
  entries: TimeEntryData[];
  projects: Project[];
  tasks: [];
}

interface Project {
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  entries,
  projects,
  tasks,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [shadowEvents, setShadowEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState("timeGridDay");
  const calendarRef = useRef<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  // Random color generator
  const getRandomColor = () => {
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
  };

  // Calculate duration between two dates
  const calculateDuration = (start: Date, end: Date): string => {
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  // Create a sample time entry with all required fields
  const createSampleTimeEntry = (
    id: string,
    description: string,
    projectId: string,
    projectName: string,
    taskId: string | undefined,
    taskName: string | undefined,
    startTime: string,
    endTime: string,
    isShadow: boolean
  ): TimeEntryData => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const color = getRandomColor();

    return {
      id,
      description,
      projectId,
      projectName,
      taskId,
      taskName,
      startTime,
      endTime,
      duration: calculateDuration(start, end),
      date: new Date(start.toDateString()),
      createdAt: new Date(),
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: color.text,
      isShadow,
    };
  };

  const handleEventClick = (info: any) => {
    const event = info.event;

    // Check if this is a shadow event
    if (event.extendedProps.isShadow) {
      console.log(info);

      // Convert shadow to a real event by opening the modal
      const timeEntry = calendarEventToTimeEntry({
        id: `real-${Date.now()}`,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        textColor: event.textColor,
        extendedProps: {
          ...event.extendedProps,
          isShadow: false,
        },
      });

      setSelectedEvent(timeEntry);
      setIsModalOpen(true);
    } else {
      // For regular events, just open the edit modal
      const timeEntry = calendarEventToTimeEntry({
        id: event.id,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        textColor: event.textColor,
        extendedProps: event.extendedProps,
      });

      setSelectedEvent(timeEntry);
      setIsModalOpen(true);
    }
  };
  const handleSelect = (info: any) => {
    setSelectedTimeRange({
      start: info.start,
      end: info.end,
    });

    setSelectedEvent(null);
    setIsModalOpen(true);
  };
  useEffect(() => {

    // Fetch real events from API
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();

        // Convert API data to CalendarEvent format
        const calendarEvents = data.map((entry: TimeEntryData) =>
          timeEntryToCalendarEvent(entry)
        );

        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        // Use sample data for demonstration

        // setEvents(sampleEvents.map((entry) => timeEntryToCalendarEvent(entry)));
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // Fetch events from API
    const initClient = () => {
      gapi.load("client:auth2", () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
          scope: SCOPES,
        });
      });
    };
    initClient();

    // fetchEvents()
  }, []);

  useEffect(() => {
    const formattedEvents = entries.map((entry) => ({
      id: entry.id,
      title: entry.description,
      start: new Date(`${entry.date.toDateString()} ${entry.startTime}`),
      end: new Date(`${entry.date.toDateString()} ${entry.endTime}`),
      backgroundColor: "#e0f7fa",
      borderColor: "#00acc1",
      textColor: "#006064",
    }));

    setEvents(formattedEvents);
  }, [entries]);

  const handleLogin = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      console.log("Signed in as:", user.getBasicProfile().getEmail());
      fetchCalendarEvents();
    } catch (error) {
      console.error("Google Sign-In failed:", error);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary", // or a specific calendar like isha@aubergine.co
        // timeMin: new Date().toISOString(),
        timeMin: "2025-05-01T00:00:00.000Z",
        showDeleted: false,
        singleEvents: true,
        maxResults: 20,
        orderBy: "startTime",
      });

      const events = response.result.items || [];
      console.log("Fetched events:", events);

      // Map them into your FullCalendar format
      const calendarEvents = events.map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        isShadow: true,
      }));

      setEvents(calendarEvents);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
    }
  };

  const handleDateClick = (arg: any) => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  // const handleEventClick = (info: any) => {
  //   setSelectedEvent({
  //     id: info.event.id,
  //     title: info.event.title,
  //     start: info.event.start,
  //     end: info.event.end,
  //     backgroundColor: info.event.backgroundColor,
  //     borderColor: info.event.borderColor,
  //     textColor: info.event.textColor,
  //   });
  //   setIsModalOpen(true);
  // };
  // const handleEventClick = (info: any) => {
  //   const event = info.event;

  //   // Check if this is a shadow event
  //   if (event.extendedProps.isShadow) {
  //     // Convert shadow to a real event by opening the modal
  //     const timeEntry = calendarEventToTimeEntry({
  //       id: `real-${Date.now()}`,
  //       title: "",
  //       start: event.startStr,
  //       end: event.endStr,
  //       backgroundColor: event.backgroundColor,
  //       borderColor: event.borderColor,
  //       textColor: event.textColor,
  //       extendedProps: {
  //         ...event.extendedProps,
  //         isShadow: false,
  //       },
  //     });

  //     setSelectedEvent(timeEntry);
  //     setIsModalOpen(true);
  //   } else {
  //     // For regular events, just open the edit modal
  //     const timeEntry = calendarEventToTimeEntry({
  //       id: event.id,
  //       title: event.title,
  //       start: event.startStr,
  //       end: event.endStr,
  //       backgroundColor: event.backgroundColor,
  //       borderColor: event.borderColor,
  //       textColor: event.textColor,
  //       extendedProps: event.extendedProps,
  //     });

  //     setSelectedEvent(timeEntry);
  //     setIsModalOpen(true);
  //   }
  // };

  const handleAddEvent = async (entry: TimeEntryData) => {
    try {
      // In a real app, you would send this to your API
      // const response = await fetch('/api/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // })
      // const newEvent = await response.json()

      // For demo purposes, we'll just add it to the state
      const newEntry = {
        ...entry,
        id: `real-${Date.now()}`,
        isShadow: false,
      };

      // If color is not specified, assign a random color
      if (!newEntry.backgroundColor) {
        const color = getRandomColor();
        newEntry.backgroundColor = color.bg;
        newEntry.borderColor = color.border;
        newEntry.textColor = color.text;
      }

      console.log(newEntry.startTime);
      console.log(new Date());

      const calendarEvent = timeEntryToCalendarEvent(newEntry);
      setEvents([...events, calendarEvent]);
      setIsModalOpen(false);

      if (gapi && gapi.client) {
        await gapi.client.calendar.events.insert({
          calendarId: "primary", // or use a specific calendar ID if needed
          sendUpdates: "all",
          resource: {
            summary: newEntry.taskName,
            description: newEntry.description || "",
            start: {
              dateTime: newEntry.startTime,
              timeZone: "UTC",
            },
            end: {
              dateTime: newEntry.endTime,
              timeZone: "UTC",
            },
            attendees: [{ email: "preet@aubergine.co" }],
          },
        });
        console.log("✅ Successfully added to Google Calendar");
      } else {
        console.warn("⚠️ gapi not initialized");
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // const handleAddEvent = async (event: Event) => {
  //   try {
  //     // In a real app, you would send this to your API
  //     // const response = await fetch('/api/events', {
  //     //   method: 'POST',
  //     //   headers: { 'Content-Type': 'application/json' },
  //     //   body: JSON.stringify(event),
  //     // })
  //     // const newEvent = await response.json()

  //     // For demo purposes, we'll just add it to the state

  //     const newEvent = {
  //       ...event,
  //       id: String(Date.now()),
  //     };

  //     setEvents([...events, newEvent]);
  //     setIsModalOpen(false);

  //     if (gapi && gapi.client) {
  //       await gapi.client.calendar.events.insert({
  //         calendarId: "primary", // or use a specific calendar ID if needed
  //         sendUpdates: "all",
  //         resource: {
  //           summary: event.title,
  //           description: event.title || "",
  //           start: {
  //             dateTime: new Date(event.start).toISOString(),
  //             timeZone: "UTC",
  //           },
  //           end: {
  //             dateTime: new Date(event.end as string).toISOString(),
  //             timeZone: "UTC",
  //           },
  //           attendees: [
  //             { email: "preet@aubergine.co" },
  //             { email: "hardik.s@aubergine.co" },
  //           ],
  //         },
  //       });
  //       console.log("✅ Successfully added to Google Calendar");
  //     } else {
  //       console.warn("⚠️ gapi not initialized");
  //     }
  //   } catch (error) {
  //     console.error("Error adding event:", error);
  //   }
  // };

  const handleUpdateEvent = async (entry: TimeEntryData) => {
    try {
      // In a real app, you would send this to your API
      // const response = await fetch(`/api/events/${event.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // })

      // For demo purposes, we'll just update the state
      const updatedEntry = {
        ...entry,
        isShadow: false,
      };

      // If color is not specified, assign a random color
      if (!updatedEntry.backgroundColor) {
        const color = getRandomColor();
        updatedEntry.backgroundColor = color.bg;
        updatedEntry.borderColor = color.border;
        updatedEntry.textColor = color.text;
      }
      const calendarEvent = timeEntryToCalendarEvent(updatedEntry);
      const updatedEvents = events.map((e) =>
        e.id === calendarEvent.id ? calendarEvent : e
      );

      setEvents(updatedEvents);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      // In a real app, you would send this to your API
      // await fetch(`/api/events/${id}`, {
      //   method: 'DELETE',
      // })

      // For demo purposes, we'll just update the state
      setEvents(events.filter((e) => e.id !== id));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleViewChange = (viewType: string) => {
    setView(viewType);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(
        viewType === "day" ? "timeGridDay" : "timeGridWeek"
      );
    }
  };

  return (
    <>
      <Button onClick={handleLogin}>Sign in with Google Calendar</Button>

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
              // eventDrop= {handleEventClick}
              eventResize={handleEventClick}
              eventClick={handleEventClick}
              // eventAdd={handleAddEvent}
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
            />
          </div>

          {isModalOpen && (
            <EventModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddEvent}
              onUpdate={handleUpdateEvent}
              onDelete={handleDeleteEvent}
              event={selectedEvent}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CalendarView;
