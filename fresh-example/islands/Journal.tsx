import { useEffect, useState } from "preact/hooks";
import { Entry } from "../types/entry.ts";
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  updateEntry,
} from "../services/entries.ts";
import EntryDialog from "../components/EntryDialog.tsx";
import EntryList from "../components/EntryList.tsx";
import EntryButton from "../components/EntryButton.tsx";

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchEntries()
      .then(setEntries)
      .catch((error) => console.error("Error fetching entries:", error));
  }, []);

  const handleCreate = async (content: string) => {
    try {
      const newEntry = await createEntry(content);
      setEntries((prev) => [newEntry, ...prev]);
      setDialogOpen(false); // Close dialog after creation
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  const handleEdit = (id: string) => {
    const entry = entries.find((entry) => entry.id === id);
    if (!entry) return;
    setEditingEntry(entry);
    setDialogOpen(true); // Open dialog for editing
  };

  const handleUpdate = async (content: string) => {
    if (!editingEntry) return;
    try {
      const updatedEntry = await updateEntry(editingEntry.id, content);
      setEntries((prev) =>
        prev.map((
          entry,
        ) => (entry.id === editingEntry.id ? updatedEntry : entry))
      );
      setEditingEntry(null);
      setDialogOpen(false); // Close dialog after updating
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleOpenDialog = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  return (
    <>
      <EntryButton onOpenDialog={handleOpenDialog} />
      <EntryDialog
        isOpen={isDialogOpen}
        onSubmit={editingEntry ? handleUpdate : handleCreate}
        onClose={() => {
          setDialogOpen(false);
          setEditingEntry(null);
        }}
        initialContent={editingEntry?.content}
      />
      <EntryList
        entries={entries}
        onView={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
