import { mockEvents } from "@/lib/mock-data";
import EventsPageClient from "./EventsPageClient";

export default async function EventsPage() {
  // Using mock data instead of database for now
  const events = mockEvents;

  return <EventsPageClient events={events} />;
}
