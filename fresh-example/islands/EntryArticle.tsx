import { Entry } from "../types/entry.ts";

interface EntryArticleProps {
  entry: Entry;
  onView?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function EntryArticle(
  { entry, onView, onEdit, onDelete }: EntryArticleProps,
) {
  return (
    <article>
      <div class="entry">{entry.content}</div>
      <footer>
        <p>
          <time datetime={entry.date}>
            {new Date(entry.date).toLocaleDateString()}
          </time>
        </p>
        {(onView || onEdit || onDelete) && (
          <ul role="list">
            {onView && (
              <li>
                <a href={`/${entry.id}`}>
                  View
                </a>
              </li>
            )}
            {onEdit && (
              <li>
                <button type="button" onClick={() => onEdit(entry.id)}>
                  Edit
                </button>
              </li>
            )}
            {onDelete && (
              <li>
                <button type="button" onClick={() => onDelete(entry.id)}>
                  Delete
                </button>
              </li>
            )}
          </ul>
        )}
      </footer>
    </article>
  );
}
