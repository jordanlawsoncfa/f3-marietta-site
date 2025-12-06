import { NextResponse } from "next/server";
import OpenAI from "openai";
import { lexiconEntries, exiconEntries, GlossaryEntry } from "@/../data/f3Glossary";
import { searchKnowledgeDocs } from "@/../data/f3Knowledge";

// Simple relevance scoring (similar to searchGlossary.ts but server-side)
// Helper to normalize query and extract core term
function extractCoreTerm(query: string): string {
    let term = query.toLowerCase().trim();

    // Remove common question prefixes
    const prefixes = ["what is a ", "what is ", "what's a ", "what's ", "whats a ", "whats ", "define "];
    for (const prefix of prefixes) {
        if (term.startsWith(prefix)) {
            term = term.slice(prefix.length);
            break;
        }
    }

    // Remove trailing punctuation
    term = term.replace(/[?.,!]+$/, "");

    return term.trim();
}

// Simple relevance scoring (similar to searchGlossary.ts but server-side)
function getRelevantEntries(query: string, entries: GlossaryEntry[], limit = 10): GlossaryEntry[] {
    if (!query) return [];
    const normalizedQuery = query.toLowerCase().trim();

    const scored = entries.map((entry) => {
        let score = 0;
        const term = entry.term.toLowerCase();
        const shortDesc = entry.shortDescription.toLowerCase();
        const longDesc = entry.longDescription?.toLowerCase() || "";

        if (term === normalizedQuery) score = 100;
        else if (term.startsWith(normalizedQuery)) score = 80;
        else if (term.includes(normalizedQuery)) score = 60;
        else if (shortDesc.includes(normalizedQuery) || longDesc.includes(normalizedQuery)) score = 30;

        return { entry, score };
    });

    return scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => s.entry);
}

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "Invalid query" }, { status: 400 });
        }

        // 1. Normalize and check for direct match
        const coreTerm = extractCoreTerm(query);
        const allEntries = [...lexiconEntries, ...exiconEntries];

        const directMatch = allEntries.find(
            (e) => e.term.toLowerCase() === coreTerm
        );

        if (directMatch) {
            // Direct match found! Return immediately without OpenAI.
            const isLexicon = lexiconEntries.some((l) => l.id === directMatch.id);
            const type = isLexicon ? "Lexicon" : "Exicon";
            const url = `/glossary#${directMatch.id}`;

            const answerText = `${directMatch.term}: ${directMatch.shortDescription}${directMatch.longDescription ? ` ${directMatch.longDescription}` : ""
                }`;

            return NextResponse.json({
                answerText,
                relatedEntries: [{
                    type,
                    term: directMatch.term,
                    slug: directMatch.id,
                    url
                }]
            });
        }

        // 2. No direct match, proceed with OpenAI search using Knowledge Docs + Glossary
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OPENAI_API_KEY is not set");
            return NextResponse.json(
                { error: "Service configuration error. Please try again later." },
                { status: 500 }
            );
        }

        const openai = new OpenAI({ apiKey });

        // Find relevant context
        const relevantLexicon = getRelevantEntries(query, lexiconEntries, 3);
        const relevantExicon = getRelevantEntries(query, exiconEntries, 3);
        const relevantDocs = searchKnowledgeDocs(query, 3);

        const allRelevantGlossary = [...relevantLexicon, ...relevantExicon];

        // Build context string
        let contextString = "";

        if (relevantDocs.length > 0) {
            contextString += "--- F3 KNOWLEDGE DOCS ---\n";
            contextString += relevantDocs.map(d => `Title: ${d.title}\nContent:\n${d.content}`).join("\n\n");
            contextString += "\n\n";
        }

        if (allRelevantGlossary.length > 0) {
            contextString += "--- F3 GLOSSARY ENTRIES ---\n";
            contextString += allRelevantGlossary
                .map((e) => `Term: ${e.term}\nType: ${lexiconEntries.includes(e) ? "Lexicon" : "Exicon"}\nDefinition: ${e.shortDescription}`)
                .join("\n\n");
        }

        // Call OpenAI with strict prompt
        const systemPrompt = `You are the official F3 Marietta Assistant.

You must ONLY answer questions using the provided F3 Knowledge Docs and Glossary entries.

Rules:
- Use ONLY the provided context as your source of truth.
- Do NOT rely on outside or general world knowledge.
- If the provided context does not contain an answer, say:
  "I couldn’t find an answer in the F3 Marietta knowledge base. Try asking about specific terms or check the About page."
- Do NOT invent definitions or meanings.
- Stay within the context of F3, workouts, and F3 terminology.
- Keep answers concise, friendly, and encouraging.

Context:
${contextString}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
            max_tokens: 250,
            temperature: 0.5, // Lower temperature for more deterministic answers
        });

        const answerText = completion.choices[0]?.message?.content || "I couldn't generate an answer at this time.";

        // Format related entries
        const relatedEntries = allRelevantGlossary.map((entry) => {
            const isLexicon = lexiconEntries.some((l) => l.id === entry.id);
            const type = isLexicon ? "Lexicon" : "Exicon";
            return {
                type,
                term: entry.term,
                slug: entry.id,
                url: `/glossary#${entry.id}`,
            };
        });

        // Add related pages if docs were used
        // This is a simple mapping for now
        const relatedPages = relevantDocs.map(d => {
            if (d.id === "about" || d.id === "mission" || d.id === "leadership") return { title: "About Us", url: "/about" };
            if (d.id === "first-workout") return { title: "New to F3", url: "/fng" };
            if (d.id === "marietta") return { title: "Community", url: "/community" };
            return null;
        }).filter(Boolean);

        // Deduplicate related pages
        const uniqueRelatedPages = Array.from(new Set(relatedPages.map(p => JSON.stringify(p)))).map(s => JSON.parse(s));

        return NextResponse.json({
            answerText,
            relatedEntries,
            relatedPages: uniqueRelatedPages
        });
    } catch (error) {
        console.error("Error in assistant API:", error);
        return NextResponse.json(
            { error: "There was a problem answering your question. Please try again." },
            { status: 500 }
        );
    }
}
