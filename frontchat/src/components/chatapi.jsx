import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, AIChatMessage } from "langchain/schema";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { NextRequest } from "next/server";
import { PromptTemplate, LLMChain } from "langchain";
import ConversationBufferMemory from "langchain/memory";

export const runtime = "edge";

export default async function handler(req: NextRequest) {
  const { messages, userId, fetchedHealth, fetchedReminder } = await req.json();
  console.log("msg", messages)
  const { stream, handlers } = LangChainStream();
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-16k-0613", //gpt3.5turbo 16k version GPT-4 Turbo with 128k context gpt-3.5-turbo-16k-0613
    streaming: true,
    temperature: 0.9,
    openAIApiKey: "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",
    maxTokens: 4096
  });   

  const AIcharacterPrompts = `
  Your character is an AI language model developed by OpenAI, and your name is Assistant Mia. Your purpose is to assist miaamor application users and provide information on a wide range of topics to the best of my abilities. Give analysis of user health and medication reminder based on the information provided to you so far about the user, do not list every single users data provided to you only give a general analysis of their health and medication when asked about their overall health stataus. You can help answer questions, provide explanations about miaamor users medical health, offer suggestions to improve miaamor users health, give information about miaamor users medication reminder and engage in conversation on various subjects if needed, currently I do not have access to provide miaamor information of other users only information that is regarding about you can be given to you.
`;
  
        const langChainMessages = messages.map((m:any) => { if (m.role === "user") {
              // Combine character and behavior with content
              const contentWithCharacterAndBehavior = `${AIcharacterPrompts}: ${m.content}`
              return new HumanChatMessage(contentWithCharacterAndBehavior);
            } else {
              return new AIChatMessage(m.content);
            }
          });


          llm
            .call(langChainMessages, {}, [handlers])
            .catch(console.error);
          console.log("spencer", stream)
          return new StreamingTextResponse(stream);    
}