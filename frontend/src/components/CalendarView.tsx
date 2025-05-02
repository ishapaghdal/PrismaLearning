"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import ProjectSidebar from "./Sidebar";
import EventModal from "./EventModal";
import type { Event } from "@/types/event";
import { gapi } from "gapi-script";
import TimeEntry from "./TimeEntry";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar";

export default function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState("timeGridDay");
  const calendarRef = useRef<any>(null);

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
        timeMin: new Date().toISOString(),
        // timeMin: '2025-05-01T00:00:00.000Z',
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

  const handleEventClick = (info: any) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      textColor: info.event.textColor,
    });
    setIsModalOpen(true);
  };

  const handleAddEvent = async (event: Event) => {
    try {
      // In a real app, you would send this to your API
      // const response = await fetch('/api/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // })
      // const newEvent = await response.json()

      // For demo purposes, we'll just add it to the state

      const newEvent = {
        ...event,
        id: String(Date.now()),
      };

      setEvents([...events, newEvent]);
      setIsModalOpen(false);

      if (gapi && gapi.client) {
        await gapi.client.calendar.events.insert({
          calendarId: "primary", // or use a specific calendar ID if needed
          sendUpdates: "all",
          resource: {
            summary: event.title,
            description: event.title || "",
            start: {
              dateTime: new Date(event.start).toISOString(),
              timeZone: "UTC",
            },
            end: {
              dateTime: new Date(event.end as string).toISOString(),
              timeZone: "UTC",
            },
            attendees: [
              { email: "preet@aubergine.co" },
              { email: "hardik.s@aubergine.co" },
            ],
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

  const handleUpdateEvent = async (event: Event) => {
    try {
      // In a real app, you would send this to your API
      // const response = await fetch(`/api/events/${event.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // })

      // For demo purposes, we'll just update the state
      const updatedEvents = events.map((e) => (e.id === event.id ? event : e));

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
              events={events}
              dateClick={handleDateClick}
              // eventDrop= {handleEventClick}
              eventResize={handleEventClick}
              eventClick={handleEventClick}
              eventAdd={handleAddEvent}
              select={handleEventClick}
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
}
