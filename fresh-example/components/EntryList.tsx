import { Entry } from "../types/entry.ts";
import EntryArticle from "../islands/EntryArticle.tsx";

interface EntryListProps {
  entries: Entry[];
  onView: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function EntryList(
  { entries, onView, onEdit, onDelete }: EntryListProps,
) {
  if (entries.length === 0) {
    return (
      <article>
        <p>No entries available.</p>
      </article>
    );
  }

  return (
    <>
      {entries.map((entry) => (
        <EntryArticle
          key={entry.id}
          entry={entry}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
