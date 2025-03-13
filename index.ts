import fs from "fs";
import { GoogleGenAI } from "@google/genai";

// https://googleapis.github.io/js-genai/
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    baseUrl: "https://gemini.aiuuuu.com", // 代理地址绕过地域限制
  },
});

// Converts local file information to base64
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function run() {
  const prompt = "Convert the following image to pixel style";

  const imageParts = [fileToGenerativePart("test.png", "image/png")];

  const generatedContent = await genAI.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [prompt, ...imageParts],
    config: {
      responseModalities: ["text", "image"],
    },
  });

  for (const candidate of generatedContent.candidates) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        fs.writeFileSync(
          "output." + part.inlineData.mimeType.split("/")[1],
          Buffer.from(part.inlineData.data, "base64")
        );
      } else if (part.text) {
        console.log(part.text);
      }
    }
  }
  console.log(generatedContent.text);
}

run();
