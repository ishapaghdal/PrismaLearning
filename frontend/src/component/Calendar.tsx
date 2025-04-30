import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { v4 as uuidv4 } from 'uuid';

const getStoredEvents = () => {
  const data = localStorage.getItem('calendar-events');
  return data ? JSON.parse(data) : [];
};

const saveEvents = (events) => {
  localStorage.setItem('calendar-events', JSON.stringify(events));
};

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(getStoredEvents());
  }, []);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const handleEventDrop = (info) => {
    const updatedEvents = events.map((event) =>
      event.id === info.event.id
        ? {
            ...event,
            start: info.event.start.toISOString(),
            end: info.event.end.toISOString(),
          }
        : event
    );
    setEvents(updatedEvents);
  };

  const handleEventResize = (info) => {
    const updatedEvents = events.map((event) =>
      event.id === info.event.id
        ? {
            ...event,
            start: info.event.start.toISOString(),
            end: info.event.end.toISOString(),
          }
        : event
    );
    setEvents(updatedEvents);
  };

  const handleDateSelect = (selectInfo) => {
    const newEvent = {
      id: uuidv4(),
      title: 'New Task',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      backgroundColor: '#b3e5fc',
      borderColor: '#03a9f4',
      color : '#000'
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        slotMinTime="00:00:00"
        slotMaxTime="23:59:59"
        editable={true}
        selectable={true}
        eventResizableFromStart={true}
        events={events}
        timeZone="UTC"
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        select={handleDateSelect}
        height="auto"
      />
    </div>
  );
};

export default Calendar;
