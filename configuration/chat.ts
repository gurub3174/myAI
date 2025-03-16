import { OWNER_NAME, AI_NAME } from "./identity";

export const INITIAL_MESSAGE: string = `Hello, I'm ${AI_NAME}, ${OWNER_NAME}'s AI assistant.`;
export const DEFAULT_RESPONSE_MESSAGE: string = `Sorry, I'm having trouble generating a response. Please try again later.`;
export const WORD_CUTOFF: number = 8000; // Number of words until bot says it needs a break
export const WORD_BREAK_MESSAGE: string = "Whoa, we've been talking a lot! I need a quick break before continuing. Let’s pick up where we left off in a fresh chat!";
export const HISTORY_CONTEXT_LENGTH: number = 7; // Number of messages to use for context when generating a response
