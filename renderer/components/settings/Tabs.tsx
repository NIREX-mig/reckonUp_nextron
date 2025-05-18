import React, { useState } from "react";

const Tabs = ({activeTab, setActiveTab}) => {
  

  const tabs = [
    { id: "general", label: "General" },
    { id: "export", label: "Export" },
    { id: "profile", label: "Profile" },
    { id: "settings", label: "Settings" },
    { id: "feedback", label: "Feedback" },
  ];

  return (
    <div className="bg-primary-50 border text-primary-800 font-semibold border-primary-500 mb-1 p-2 rounded-md">
      {tabs.map((tab, i) => {
        return (
          <button
            key={tab.id}
            className={`px-4 py-2 ${
              activeTab === tab.id ? "border-b-2 border-primary-900 font-bold" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
