import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { AIProviders, Chat, Intention } from "@/types";
import { IntentionModule } from "@/modules/intention";
import { ResponseModule } from "@/modules/response";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";
import Anthropic from "@anthropic-ai/sdk";
import {
  RESPOND_TO_QUESTION_SYSTEM_PROMPT,
  RESPOND_TO_HOSTILE_MESSAGE_SYSTEM_PROMPT,
  RESPOND_TO_CARD_COMPARISON_SYSTEM_PROMPT,
  RESPOND_TO_CREDIT_SCORE_IMPROVEMENT_PROMPT,
  RESPOND_TO_CARD_RECOMMENDATION_SYSTEM_PROMPT,
} from "@/configuration/prompts";

export const maxDuration = 60;

// Get API keys
const pineconeApiKey = process.env.PINECONE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const fireworksApiKey = process.env.FIREWORKS_API_KEY;

// Check if API keys are set
if (!pineconeApiKey) {
  throw new Error("PINECONE_API_KEY is not set");
}
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

// Initialize Pinecone
const pineconeClient = new Pinecone({
  apiKey: pineconeApiKey,
});
const pineconeIndex = pineconeClient.Index(PINECONE_INDEX_NAME);

// Initialize Providers
const openaiClient = new OpenAI({
  apiKey: openaiApiKey,
});
const anthropicClient = new Anthropic({
  apiKey: anthropicApiKey,
});
const fireworksClient = new OpenAI({
  baseURL: "https://api.fireworks.ai/inference/v1",
  apiKey: fireworksApiKey,
});
const providers: AIProviders = {
  openai: openaiClient,
  anthropic: anthropicClient,
  fireworks: fireworksClient,
};

async function determineIntention(chat: Chat): Promise<Intention> {
  return await IntentionModule.detectIntention({
    chat: chat,
    openai: providers.openai,
  });
}

export async function POST(req: Request) {
  const { chat } = await req.json();
  const intention: Intention = await determineIntention(chat);

  if (intention.type === "question") {
    return ResponseModule.respondToQuestion(
      chat, 
      providers, 
      pineconeIndex, 
      RESPOND_TO_QUESTION_SYSTEM_PROMPT
    );
  } 
  
  else if (intention.type === "hostile_message") {
    return ResponseModule.respondToHostileMessage(chat, providers);
  } 
  
  else if (intention.type === "compare_cards") {
    return ResponseModule.respondToQuestion(
      chat, 
      providers, 
      pineconeIndex, 
      RESPOND_TO_CARD_COMPARISON_SYSTEM_PROMPT
    );
  } 
  
  else if (intention.type === "credit_score_improvement") {
    return ResponseModule.respondToQuestion(
      chat, 
      providers, 
      pineconeIndex, 
      RESPOND_TO_CREDIT_SCORE_IMPROVEMENT_PROMPT
    );
  }

  else if (intention.type === "card_recommendation") {
    return ResponseModule.respondToQuestion(
      chat, 
      providers, 
      pineconeIndex, 
      RESPOND_TO_CARD_RECOMMENDATION_SYSTEM_PROMPT
    );
  }

  else if (chat.messages[chat.messages.length - 1].content.toLowerCase().trim() === "hi" ||
           chat.messages[chat.messages.length - 1].content.toLowerCase().trim() === "hello" ||
           chat.messages[chat.messages.length - 1].content.toLowerCase().trim() === "what's up") {
    return new Response(
      JSON.stringify({ message: INITIAL_MESSAGE }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  else {
    return ResponseModule.respondToRandomMessage(chat, providers);
  }
}
