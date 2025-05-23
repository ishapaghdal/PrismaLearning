// import FullCalendar from '@fullcalendar/react'
// import dayGridPlugin from '@fullcalendar/daygrid'
// import { WeekNumberContainer } from '@fullcalendar/core/internal.js';
import Calendar from "./components/Calendar";
// import Calendar from "./component/Calendar";
import TimeEntry from "./components/TimeEntry";
import CalendarView from "./components/CalendarView";

import "./App.css";
import "./index.css";
import ProjectSidebar from "./components/Sidebar";

// export function Calendar() {
//   return (
//     <FullCalendar
//       plugins={[ dayGridPlugin ]}
//       initialView="dayGridMonth"
//       titleFormat={{week : 'long'}}
//       titleRangeSeparator='of'
//       contentHeight={'1100px'}
//       allDayText='hello'
//       dayCount={5}
//       weekends= {false}
//       weekNumbers= {true}
//       displayEventTime={}
//       events={[
//         { title: 'event 1', date: '2025-04-13' },
//         { title: 'event 2', date: '2025-04-18' }
//       ]}
//     />
//   )
// }

function App() {
  return (
    <>
      {/* <Calendar /> */}
      <div className="flex">
        {/* <CalendarView /> */}
        <ProjectSidebar />
        <TimeEntry />
      </div>
    </>
  );
}

export default App;
