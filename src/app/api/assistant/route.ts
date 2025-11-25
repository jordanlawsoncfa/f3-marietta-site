import { NextResponse } from "next/server";
import OpenAI from "openai";
import { lexiconEntries, exiconEntries, GlossaryEntry } from "@/../data/f3Glossary";

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

        // 2. No direct match, proceed with OpenAI search
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
        const relevantLexicon = getRelevantEntries(query, lexiconEntries, 5);
        const relevantExicon = getRelevantEntries(query, exiconEntries, 5);
        const allRelevant = [...relevantLexicon, ...relevantExicon];

        // Build context string
        const contextString = allRelevant
            .map((e) => `Term: ${e.term}\nType: ${lexiconEntries.includes(e) ? "Lexicon" : "Exicon"}\nDefinition: ${e.shortDescription}`)
            .join("\n\n");

        // Call OpenAI with strict prompt
        const systemPrompt = `You are the official F3 Marietta Assistant.

You must ONLY answer questions using the provided F3 Lexicon and Exicon entries and the content of the F3 Marietta website.

Rules:
- Use ONLY the glossary entries passed in the prompt as your source of truth.
- Do NOT rely on outside or general world knowledge.
- If the glossary data does not contain an answer, say:
  "I couldn’t find this term in the F3 Lexicon or Exicon. Here are the closest related entries."
- Do NOT invent definitions or meanings.
- Stay within the context of F3, workouts, and F3 terminology.

Context:
${contextString}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
            max_tokens: 150,
            temperature: 0.5, // Lower temperature for more deterministic answers
        });

        const answerText = completion.choices[0]?.message?.content || "I couldn't generate an answer at this time.";

        // Format related entries
        const relatedEntries = allRelevant.map((entry) => {
            const isLexicon = lexiconEntries.some((l) => l.id === entry.id);
            const type = isLexicon ? "Lexicon" : "Exicon";
            return {
                type,
                term: entry.term,
                slug: entry.id,
                url: `/glossary#${entry.id}`,
            };
        });

        return NextResponse.json({
            answerText,
            relatedEntries,
        });
    } catch (error) {
        console.error("Error in assistant API:", error);
        return NextResponse.json(
            { error: "There was a problem answering your question. Please try again." },
            { status: 500 }
        );
    }
}
