import { useState } from 'react';
import './App.css';
import { Search, Plus, MoreVertical } from "lucide-react";
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  const meniu = [
    { name: "URL apsauga", hint: "SSL sertifikatų tikrinimas..." },
    { name: "El. pašto apsauga", hint: "Laiško tikrinimas, pavojingų failų analizė.." },
    { name: "Tracker tikrintojas", hint: "Kažką tikrina..." },
    { name: "Slapukų analizė", hint: "Sausainiai, mmmm..." },
  ];

  return (
    <div className="main-window">
      {/* Top Search Bar */}
      <div className="top-bar fixed-top">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search"
          className="search-input"
        />
      </div>

      {/* Middle Menu Section */}
      <div className="middle-menu">
          <h2 className="items-title">All items</h2>
          <div className="items-list">
            {meniu.map((item, index) => (
              <button key={index} className="menu-button">
                <p className="menu-name">{item.name}</p>
                <p className="menu-hint">{item.hint}</p>
              </button>
            ))}
          </div>
      </div>

      {/* Bottom Page Selection Buttons */}
      <div className="bottom-buttons fixed-bottom">
        <button className="page-button">Settings</button>
        <button className="page-button">Timeline</button>
        <button className="page-button">Button 3</button>
        <button className="page-button">Button 4</button>
      </div>
    </div>
  );
}

export default App;
