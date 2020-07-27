import React from "react";
import data from "./mock-data.json";

function App() {
  return (
    <div>
      <ul>
        {data.map((x) => {
          const { date, activity } = x;
          return (
            <li key={date}>
              {date}: {activity}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
