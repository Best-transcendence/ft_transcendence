// services/presence.ts
import { onSocketMessage, sendWSMessage } from "./ws";

const onlineSet = new Set<number>();
let unsub: (() => void) | null = null;

function setStatusElement(id: number, isOnline: boolean) {
  const el = document.getElementById(`friend-status-${id}`);
  if (!el) return;
  el.classList.toggle("text-green-400", isOnline);
  el.classList.toggle("text-red-400", !isOnline);
  el.textContent = "●";
  el.title = isOnline ? "Online" : "Offline";
  el.setAttribute("aria-label", isOnline ? "Online" : "Offline");
}

export function initPresence() {
  if (unsub) return;
  // Request a fresh snapshot in case we mounted after socket.onopen
  sendWSMessage("presence:list:request", {});
  unsub = onSocketMessage((msg) => {
    switch (msg.type) {
      case "presence:list":
        onlineSet.clear();
        (msg.users || []).forEach((id: number) => onlineSet.add(Number(id)));
        document.querySelectorAll("[data-user-id]").forEach((node) => {
          const uid = Number((node as HTMLElement).dataset.userId);
          setStatusElement(uid, onlineSet.has(uid));
        });
        break;
      case "presence:online":
        onlineSet.add(Number(msg.id));
        setStatusElement(Number(msg.id), true);
        break;
      case "presence:offline":
        onlineSet.delete(Number(msg.id));
        setStatusElement(Number(msg.id), false);
        break;
    }
  });
}

export function teardownPresence() {
  if (unsub) { unsub(); unsub = null; }
  onlineSet.clear();
  document.querySelectorAll("[data-user-id]").forEach((node) => {
    const uid = Number((node as HTMLElement).dataset.userId);
    setStatusElement(uid, false);
  });
}

export function isUserOnline(id: number) { return onlineSet.has(id); }
