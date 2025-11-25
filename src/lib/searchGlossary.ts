import { GlossaryEntry } from "@/../data/f3Glossary";

export function searchGlossaryEntries(entries: GlossaryEntry[], query: string): GlossaryEntry[] {
    if (!query || query.trim() === "") {
        return entries;
    }

    const normalizedQuery = query.toLowerCase().trim();

    const scoredEntries = entries.map((entry) => {
        let score = 0;
        const term = entry.term.toLowerCase();
        const shortDesc = entry.shortDescription.toLowerCase();
        const longDesc = entry.longDescription?.toLowerCase() || "";

        if (term === normalizedQuery) {
            score = 100; // Exact match
        } else if (term.startsWith(normalizedQuery)) {
            score = 80; // Starts with
        } else if (term.includes(normalizedQuery)) {
            score = 60; // Contains
        } else if (shortDesc.includes(normalizedQuery) || longDesc.includes(normalizedQuery)) {
            score = 30; // Description match
        }

        return { entry, score };
    });

    // Filter out non-matches and sort
    return scoredEntries
        .filter((item) => item.score > 0)
        .sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score; // Descending score
            }
            return a.entry.term.localeCompare(b.entry.term); // Alphabetical tie-breaker
        })
        .map((item) => item.entry);
}
