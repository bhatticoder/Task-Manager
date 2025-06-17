import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "YOUR-API-KEY",
});

export async function fetchAISuggestion(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: prompt },
    ],
  });
  return completion.choices[0].message.content;
}
