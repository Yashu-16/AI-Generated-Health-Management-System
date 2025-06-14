
import { useActivity } from "@/context/ActivityContext";
import { Clock } from "lucide-react";

const formatTime = (d: Date) => {
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
};

const ActivityLog = () => {
  const { activities } = useActivity();

  if (!activities.length) {
    return (
      <div className="text-muted-foreground text-sm px-3 py-2">
        No activities yet.
      </div>
    );
  }

  return (
    <div className="h-48 max-h-60 overflow-y-auto rounded-lg border bg-white p-3 shadow-sm mt-4">
      <div className="font-semibold mb-2 flex items-center gap-2 text-primary">
        <Clock className="h-4 w-4" />
        Activity Log
      </div>
      <ul className="space-y-2">
        {activities.map((a) => (
          <li key={a.id} className="flex justify-between text-sm">
            <span>{a.message}</span>
            <span className="text-xs text-muted-foreground">{formatTime(new Date(a.timestamp))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ActivityLog;
