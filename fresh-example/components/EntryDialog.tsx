import { useEffect, useRef } from "preact/hooks";

interface EntryDialogProps {
  isOpen: boolean;
  onSubmit: (content: string) => void;
  onClose: () => void;
  initialContent?: string;
}

export default function EntryDialog({
  isOpen,
  onSubmit,
  onClose,
  initialContent = "",
}: EntryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const content = textareaRef.current?.value.trim();
    if (!content) {
      console.error("Content field is empty.");
      return;
    }
    onSubmit(content);
  };

  return (
    <dialog ref={dialogRef} class="wrapper">
      <form onSubmit={handleSubmit}>
        <label for="entry">What's going on?</label>
        <textarea
          name="content"
          id="entry"
          rows={10}
          ref={textareaRef}
          defaultValue={initialContent}
        >
        </textarea>
        <footer>
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button class="cta">Submit</button>
        </footer>
      </form>
    </dialog>
  );
}
