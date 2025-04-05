interface EntryButtonProps {
  onOpenDialog: () => void;
}

export default function EntryButton({ onOpenDialog }: EntryButtonProps) {
  return (
    <nav aria-label="global">
      <button
        type="button"
        class="cta"
        onClick={() => onOpenDialog()}
      >
        Write
      </button>
    </nav>
  );
}
