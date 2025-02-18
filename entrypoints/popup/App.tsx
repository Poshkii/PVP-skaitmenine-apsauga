import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';
import { Search, Plus, MoreVertical } from "lucide-react";

function App() {
  const meniu = [
    { name: "URL apsauga", hint: "SSL sertifikatų tikrinimas..." },
    { name: "El. pašto apsauga", hint: "Laiško tikrinimas, pavojingų failų analizė.." },
    { name: "Tracker tikrintojas", hint: "Kažką tikrina..." },
    { name: "Slapukų analizė", hint: "Sausainiai, mmmm..." },
  ];

  return (
  <div className="main-window">
    {/* Sidebar */}
    <div className="w-96 bg-gray-800 p-4 flex flex-col">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search"
          className="pl-8 bg-gray-700 text-white border-none focus:ring-0 w-full p-2 rounded"
        />
      </div>

      {/* Saved items */}
      <div>
        <h2 className="text-sm text-gray-400">All items</h2>
        <div className="mt-2 space-y-2">
          {meniu.map((item, index) => (
            <button key={index} className="menu-button">
              <p className="menu-name">{item.name}</p>
              <p className="menu-hint">{item.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}

export default App;
