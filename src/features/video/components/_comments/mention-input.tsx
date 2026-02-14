'use client';

import { useUserSearch } from '@/api/queries/users.queries';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn } from '@/shared/utils/formatting';
import type { MentionUser } from '@/types/mention';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export interface MentionInputHandle {
  focus: () => void;
  insertAtCursor: (text: string) => void;
}

interface MentionContext {
  query: string;
  startIndex: number;
}

function extractMentionQuery(text: string, cursorPos: number): MentionContext | null {
  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/(^|[\s])@(\w*)$/);
  if (!match) return null;

  const query = match[2] ?? '';
  const atIndex = beforeCursor.lastIndexOf('@' + query);
  return { query, startIndex: atIndex };
}

export const MentionInput = forwardRef<MentionInputHandle, MentionInputProps>(function MentionInput(
  { value, onChange, onKeyDown, placeholder, disabled, className, rows = 1 },
  ref
) {
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mentionContext = extractMentionQuery(value, cursorPosition);
  const showDropdown = mentionContext !== null;
  const searchQuery = mentionContext?.query ?? '';

  const debouncedQuery = useDebounce(searchQuery, 300);

  const currentUserUuid = useAuthStore((s) => s.user?.uuid);

  const { data: users = [], isLoading } = useUserSearch(
    debouncedQuery,
    showDropdown && debouncedQuery.length >= 4
  );

  const filteredUsers = users.filter((u) => u.uuid !== currentUserUuid);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
    insertAtCursor: (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const newValue = before + text + after;
      onChange(newValue);

      const newPos = start + text.length;
      requestAnimationFrame(() => {
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
        textarea.focus();
        setCursorPosition(newPos);
      });
    },
  }));

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  const insertMention = useCallback(
    (user: MentionUser) => {
      if (!mentionContext) return;

      const before = value.slice(0, mentionContext.startIndex);
      const after = value.slice(mentionContext.startIndex + 1 + mentionContext.query.length);
      const newValue = `${before}@${user.handler} ${after}`;
      onChange(newValue);

      // Position cursor after the inserted mention
      const newCursorPos = mentionContext.startIndex + 1 + user.handler.length + 1;
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newCursorPos;
          textareaRef.current.selectionEnd = newCursorPos;
          textareaRef.current.focus();
        }
      });
    },
    [mentionContext, value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showDropdown && filteredUsers.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          const user = filteredUsers[selectedIndex];
          if (user) {
            e.preventDefault();
            insertMention(user);
            return;
          }
        }
      }
      if (e.key === 'Escape' && showDropdown) {
        e.preventDefault();
        // Move cursor to dismiss the mention context
        return;
      }
      onKeyDown?.(e);
    },
    [showDropdown, filteredUsers, selectedIndex, insertMention, onKeyDown]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      setCursorPosition(e.target.selectionStart);
    },
    [onChange]
  );

  const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition((e.target as HTMLTextAreaElement).selectionStart);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        // Move cursor past the @ to dismiss context
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showDropdown]);

  const showResults = showDropdown && debouncedQuery.length >= 4;
  const showMinChars = showDropdown && searchQuery.length > 0 && searchQuery.length < 4;

  return (
    <div className="relative flex-1">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={className}
      />

      {showResults || showMinChars ? (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto"
        >
          {showMinChars ? (
            <div className="px-3 py-2 text-xs text-text-secondary">
              Type at least 4 characters to search
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <Spinner size="sm" />
              <span className="text-xs text-text-secondary">Searching users...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <button
                key={user.uuid}
                type="button"
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-left transition-colors',
                  index === selectedIndex ? 'bg-hover' : 'hover:bg-hover'
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(user);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Avatar
                  src={user.avatar_small}
                  alt={user.display_name}
                  fallback={user.display_name || user.handler}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {user.display_name || user.handler}
                  </p>
                  <p className="text-xs text-text-secondary truncate">@{user.handler}</p>
                </div>
                {user.is_creator ? (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-primary/20 text-red-primary rounded-full font-medium flex-shrink-0">
                    Creator
                  </span>
                ) : null}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-text-secondary">No users found</div>
          )}
        </div>
      ) : null}
    </div>
  );
});
