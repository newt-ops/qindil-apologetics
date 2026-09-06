import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BookmarkItem {
  slug: string;
  title: string;
  topic?: {
    name: string;
    slug?: string;
  };
  excerpt?: string;
  coverImageUrl?: string;
  estimatedReadTime?: number;
  savedAt: string;
}

export interface ReadingHistoryItem {
  slug: string;
  title: string;
  topicName?: string;
  coverImageUrl?: string;
  estimatedReadTime?: number;
  readAt: string;
}

interface ReaderState {
  bookmarks: BookmarkItem[];
  readingHistory: ReadingHistoryItem[];
  totalReadingMinutes: number;

  // Actions
  toggleBookmark: (item: Omit<BookmarkItem, 'savedAt'>) => boolean; // returns true if now saved, false if removed
  removeBookmark: (slug: string) => void;
  isBookmarked: (slug: string) => boolean;

  recordRead: (item: Omit<ReadingHistoryItem, 'readAt'>) => void;
  clearHistory: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      readingHistory: [],
      totalReadingMinutes: 0,

      toggleBookmark: (item) => {
        const current = get().bookmarks;
        const exists = current.some((b) => b.slug === item.slug);

        if (exists) {
          set({
            bookmarks: current.filter((b) => b.slug !== item.slug),
          });
          return false;
        } else {
          const newBookmark: BookmarkItem = {
            ...item,
            savedAt: new Date().toISOString(),
          };
          set({
            bookmarks: [newBookmark, ...current],
          });
          return true;
        }
      },

      removeBookmark: (slug) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.slug !== slug),
        }));
      },

      isBookmarked: (slug) => {
        return get().bookmarks.some((b) => b.slug === slug);
      },

      recordRead: (item) => {
        const history = get().readingHistory;
        const readTime = item.estimatedReadTime || 3;

        // Check if read in the past 10 minutes to prevent duplicate counting on page refresh
        const existingRecent = history.find(
          (h) => h.slug === item.slug && Date.now() - new Date(h.readAt).getTime() < 10 * 60 * 1000
        );

        if (existingRecent) {
          return;
        }

        const newEntry: ReadingHistoryItem = {
          ...item,
          readAt: new Date().toISOString(),
        };

        // Keep last 50 history entries
        const updatedHistory = [newEntry, ...history.filter((h) => h.slug !== item.slug)].slice(0, 50);

        set((state) => ({
          readingHistory: updatedHistory,
          totalReadingMinutes: state.totalReadingMinutes + readTime,
        }));
      },

      clearHistory: () => {
        set({
          readingHistory: [],
          totalReadingMinutes: 0,
        });
      },
    }),
    {
      name: 'qindil-reader-storage',
    }
  )
);

export default useReaderStore;
