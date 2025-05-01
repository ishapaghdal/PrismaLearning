"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ProjectSidebar from "./project-sidebar";
import EventModal from "./event-modal";
import type { Event } from "@/types/event";
import { gapi } from "gapi-script";

const CLIENT_ID =
  "443826232883-sl9m1so9omv5tm0gsfdgt8d3osicop4s.apps.googleusercontent.com";
const API_KEY = "AIzaSyDJmIOidEDRqHhNkV_7lUgmxBIdhfyvji8";
const SCOPES = "https://www.googleapis.com/auth/calendar";

export default function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("03:00");
  const [endTime, setEndTime] = useState("10:10");
  const [secondStartTime, setSecondStartTime] = useState("11:10");
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
        // .then(() => {
        //   // Prompt login
        //   gapi.auth2
        //     .getAuthInstance()
        //     .signIn()
        //     .then(() => {
        //       // Get events from primary calendar
        //       gapi.client.calendar.events
        //         .list({
        //           calendarId: "primary", // You can use 'isha@aubergine.co' if email calendar is shared
        //           timeMin: new Date().toISOString(), // Fetch from now
        //           showDeleted: false,
        //           singleEvents: true,
        //           maxResults: 10,
        //           orderBy: "startTime",
        //         })
        //         .then((response: any) => {
        //           const fetchedEvents = response.result.items.map(
        //             (event: any) => ({
        //               id: event.id,
        //               title: event.summary,
        //               start: event.start.dateTime || event.start.date, // Fallback for all-day
        //               end: event.end.dateTime || event.end.date,
        //               backgroundColor: "#e0f7fa",
        //               borderColor: "#00acc1",
        //               textColor: "#006064",
        //             })
        //           );
        //           setEvents(fetchedEvents);
        //         });
        //     });
        // });

        // const fetchEvents = async () => {
        // try {
        //   const response = await fetch("/api/events");
        //   const data = await response.json();
        //   setEvents(data);
        // } catch (error) {
        //   console.error("Error fetching events:", error);
        //   // Use sample data for demonstration
        //   setEvents([
        //     {
        //       id: "1",
        //       title: "Components - Profile",
        //       start: "2023-03-17T08:30:00",
        //       end: "2023-03-17T09:30:00",
        //       backgroundColor: "#f0e6ff",
        //       borderColor: "#d4bfff",
        //       textColor: "#5e35b1",
        //     },
        //     {
        //       id: "2",
        //       title: "Components - Profile",
        //       start: "2023-03-17T10:30:00",
        //       end: "2023-03-17T11:30:00",
        //       backgroundColor: "#ffebee",
        //       borderColor: "#ffcdd2",
        //       textColor: "#c62828",
        //     },
        //     {
        //       id: "3",
        //       title: "Components - Profile",
        //       start: "2023-03-17T12:30:00",
        //       end: "2023-03-17T13:30:00",
        //       backgroundColor: "#e3f2fd",
        //       borderColor: "#bbdefb",
        //       textColor: "#1565c0",
        //     },
        //     {
        //       id: "4",
        //       title: "Components - Profile",
        //       start: "2023-03-17T14:30:00",
        //       end: "2023-03-17T15:30:00",
        //       backgroundColor: "#f1f8e9",
        //       borderColor: "#dcedc8",
        //       textColor: "#33691e",
        //     },
        //     {
        //       id: "5",
        //       title: "Components - Profile",
        //       start: "2023-03-17T16:30:00",
        //       end: "2023-03-17T17:30:00",
        //       backgroundColor: "#fff8e1",
        //       borderColor: "#ffecb3",
        //       textColor: "#ff6f00",
        //     },
        //   ]);
        // }
      });
    };
    initClient();
    // gapi.load("client:auth2", initClient);

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
              { email: "kashish@aubergine.co" },
              { email: "preet@aubergine.co" },
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
        <ProjectSidebar />
        <div className="flex-1 flex flex-col">
          <header className="p-4 border-b">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                className="max-w-xs"
                placeholder="Look everywhere for calendar view"
                type="search"
              />
              <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Capstone 2023 - Meeting</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="time"
                  value={secondStartTime}
                  onChange={(e) => setSecondStartTime(e.target.value)}
                  className="w-24"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, "MM/dd/yy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsModalOpen(true)}
                >
                  Add
                </Button>
              </div>
            </div>
          </header>

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
