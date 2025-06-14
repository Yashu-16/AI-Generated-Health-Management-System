
import React, { createContext, useContext, useState, ReactNode } from "react";
type Activity = {
  id: string;
  message: string;
  timestamp: Date;
};
type ActivityContextType = {
  activities: Activity[];
  logActivity: (message: string) => void;
};
const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const logActivity = (message: string) => {
    setActivities(prev => [
      { id: `${Date.now()}-${Math.random()}`, message, timestamp: new Date() },
      ...prev.slice(0, 29), // keep max 30 logs
    ]);
  };

  return (
    <ActivityContext.Provider value={{ activities, logActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within an ActivityProvider");
  return ctx;
}
