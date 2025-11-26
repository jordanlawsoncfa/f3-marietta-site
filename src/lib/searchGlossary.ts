import type { GlossaryEntry } from "../../data/f3Glossary";

export function searchGlossaryEntries(entries: GlossaryEntry[], query: string): GlossaryEntry[] {
    const q = query.trim().toLowerCase();
    if (!q) return entries;

    const scored = entries
        .map((entry) => {
            const term = entry.term.toLowerCase();
            const shortDesc = entry.shortDescription?.toLowerCase() ?? "";
            const longDesc = entry.longDescription?.toLowerCase() ?? "";

            let score = 0;

            // Highest priority: exact term match
            if (term === q) {
                score = 100;
            }
            // Next: term starts with query
            else if (term.startsWith(q)) {
                score = 80;
            }
            // Next: term contains query anywhere
            else if (term.includes(q)) {
                score = 60;
            }
            // Finally: description matches only
            else if (shortDesc.includes(q) || longDesc.includes(q)) {
                score = 30;
            }

            return { entry, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => {
            // Sort by score descending
            if (b.score !== a.score) return b.score - a.score;
            // Tiebreaker: alphabetical by term
            return a.entry.term.localeCompare(b.entry.term);
        });

    return scored.map(({ entry }) => entry);
}
