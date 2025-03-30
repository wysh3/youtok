# Youtok Project Refactoring Plan

## 1. Goal

Clean up the AI-generated Next.js codebase, improve structure, remove redundancy, enhance maintainability, and align with best practices.

## 2. Analysis Summary

The project uses Next.js 14, React, Tailwind, and shadcn/ui. Key issues include redundant API wrappers and hooks, misplaced files (hooks in `components/ui`, API logic in `services`), a large monolithic React Context (`VideoContext`), inconsistent imports, potentially unused code/components, and deviations from best practices (hardcoded theme, basic API error handling).

## 3. Refactoring Steps

### 3.1. Consolidate API Logic

*   **Action:** Move all API interaction logic exclusively to `lib/youtube-api.ts`.
*   **Action:** Delete the `services/` directory and `services/youtube-api.tsx`.
*   **Action:** Update all imports currently pointing to `services/youtube-api` to point to the functions in `lib/youtube-api.ts`.
*   **Action:** Review `package.json` and potentially remove `axios` if only `fetch` is used.
*   **Reason:** Centralizes API logic, removes redundancy, improves clarity.

### 3.2. Consolidate and Relocate Hooks

*   **Action:** Delete `components/ui/use-mobile.tsx`. Update any imports to use `hooks/use-mobile.tsx`.
*   **Action:** Compare `hooks/use-toast.ts` and `components/ui/use-toast.ts`. Choose the best version (likely the one from `components/ui` due to its `useEffect` dependency array, but verify constants). Move the chosen logic *entirely* to `hooks/use-toast.ts`. Delete `components/ui/use-toast.ts`.
*   **Action:** Update all imports (especially in `VideoContext` and `components/ui/toaster.tsx`) to point to `hooks/use-toast.ts`.
*   **Reason:** Removes duplication, places hooks in the standard directory (`hooks/`), corrects import paths.

### 3.3. Refactor State Management (`VideoContext`)

*   **Action:** Split `VideoContext` into smaller, more focused contexts. Potential splits:
    *   `SettingsContext`: Manages `settings` state and persistence.
    *   `HistoryContext`: Manages `history`, `searchHistory`, and persistence.
    *   `FavoritesContext`: Manages `favorites` state and persistence.
    *   `SearchContext`: Manages `searchQuery`, `searchResults`, `isSearching`, `searchPage`, `hasMoreSearchResults`, and the `searchVideos` function.
    *   `VideoFeedContext`: Manages `videos` (for trending/topics), pagination (`currentPage`, `topicPage`, `hasMoreTrending`, `hasMoreTopicVideos`), `currentTopic`, and loading functions (`loadMoreTrendingVideos`, `loadMoreTopicVideos`).
*   **Action:** Update components to consume the new, smaller contexts as needed.
*   **Reason:** Improves separation of concerns, reduces context size, potentially minimizes unnecessary re-renders, enhances maintainability. *Alternative: Consider a lightweight state manager like Zustand if context splitting becomes overly complex.*

### 3.4. Improve Styling and Theming

*   **Action:** Investigate `app/globals.css` and `styles/globals.css`. Consolidate necessary global styles into one file (likely `app/globals.css` as per newer Next.js conventions) and delete the other. Update `app/layout.tsx` accordingly.
*   **Action:** Remove the hardcoded dark mode (`document.documentElement.classList.add("dark")`) from `VideoContext`.
*   **Action:** Ensure `next-themes` (`components/theme-provider.tsx`) is correctly configured in `app/layout.tsx` to handle theme switching (even if only dark mode is desired initially, use the provider for consistency).
*   **Reason:** Removes potential style duplication, uses the standard theming library correctly.

### 3.5. Enhance API Handling & Types

*   **Action:** Review API functions in `lib/youtube-api.ts`. Improve error handling to potentially throw errors or return more specific error states instead of just logging and returning empty data. Let the calling code (e.g., context/hooks) handle user-facing feedback (like toasts).
*   **Action:** Review the `Video` type in `types/video.ts` and the mapping logic in `lib/youtube-api.ts`. Ensure all necessary fields from the Piped API are correctly typed and mapped. Address any `any` types.
*   **Reason:** More robust error handling, improved type safety.

### 3.6. Code Cleanup and Removal

*   **Action:** Identify and remove unused `shadcn/ui` components from `components/ui/`. Tools like `depcheck` or manual analysis can help.
*   **Action:** Delete `lib/mock-data.ts` if confirmed unused.
*   **Action:** Delete `styles/animations.css` if confirmed unused.
*   **Action:** Review and potentially delete `docs/piped-api.txt` if it's just informational and not needed.
*   **Action:** Remove unused dependencies identified in previous steps (e.g., potentially `axios`).
*   **Reason:** Reduces bundle size, removes clutter, improves project clarity.

## 4. Implementation Order Suggestion

1.  Consolidate Hooks (3.2)
2.  Consolidate API Logic (3.1)
3.  Refactor State Management (3.3) - *This is the most significant change.*
4.  Improve Styling and Theming (3.4)
5.  Enhance API Handling & Types (3.5)
6.  Code Cleanup (3.6) - *Can be done incrementally or at the end.*

## 5. Tools for Assistance

*   ESLint/Prettier: Ensure code consistency.
*   TypeScript Compiler (`tsc --noEmit`): Check for type errors.
*   `depcheck`: Identify unused dependencies.
*   Manual Code Review: Identify unused components/files.