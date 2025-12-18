/**
 * Shared types and constants for the AI Assistant feature.
 * Used by AssistantWidget and the /api/assistant endpoint.
 */

export interface RelatedEntry {
    type: string;
    term: string;
    slug: string;
    url: string;
}

export interface RelatedPage {
    title: string;
    url: string;
}

export interface AssistantResponse {
    answerText: string;
    relatedEntries: RelatedEntry[];
    relatedPages?: RelatedPage[];
}

export const EXAMPLE_QUESTIONS = [
    "What is F3?",
    "What should I expect at my first workout?",
    "What's a CSAUP?",
    "What's the difference between the Lexicon and Exicon?",
    "What is a PAX?",
    "What does HIM stand for?",
    "When and where are workouts?",
    "What is the Shovel Flag?",
    "What is a Beatdown?",
    "What is Q Source?",
    "What is an AO?",
    "Do I need to be in shape to start?",
] as const;
