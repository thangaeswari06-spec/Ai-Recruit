import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSupabaseQuery, useSupabaseMutation } from "../../hooks/useSupabase";
import { timeAgo } from "../../utils/helpers";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: notifications, refetch } = useSupabaseQuery(
    "notifications",
    { filters: [{ column: "user_id", value: user?.id }], orderBy: { column: "created_at", ascending: false }, limit: 10, realtime: true },
    [user?.id]
  );
  const { mutate } = useSupabaseMutation("notifications");

  const unread = (notifications || []).filter((n) => !n.is_read);

  async function markAllRead() {
    await Promise.all(unread.map((n) => mutate({ type: "update", values: { is_read: true }, match: { id: n.id } })));
    refetch();
  }

  return (
    <div style={{ position: "relative" }}>
      <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        🔔
        {unread.length > 0 && <span className="badge-dot">{unread.length > 9 ? "9+" : unread.length}</span>}
      </button>

      {open && (
        <div className="dropdown-menu notif-panel">
          <div className="notif-header">
            <span>Notifications</span>
            {unread.length > 0 && <button onClick={markAllRead}>Mark all read</button>}
          </div>
          <div className="notif-list">
            {(notifications || []).length === 0 && <div className="notif-empty">No notifications yet</div>}
            {(notifications || []).map((n) => (
              <div key={n.id} className={`notif-item${!n.is_read ? " unread" : ""}`}>
                <p className="msg">{n.message}</p>
                <p className="time">{timeAgo(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}