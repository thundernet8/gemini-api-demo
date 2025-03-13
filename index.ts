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
  const prompt = "请把莱昂纳多的脸替换为特朗普的脸";

  const imageParts = [fileToGenerativePart("test2.jpg", "image/png")];

  const generatedContent = await genAI.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [prompt, ...imageParts],
    config: {
      responseModalities: ["text", "image"],
    },
  });

  let imageSeq = 1;

  for (const candidate of generatedContent.candidates) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        fs.writeFileSync(
          "image" + imageSeq + "." + part.inlineData.mimeType.split("/")[1],
          Buffer.from(part.inlineData.data, "base64")
        );
        imageSeq++;
      } else if (part.text) {
        console.log(part.text);
      }
    }
  }
  console.log(generatedContent.text);
}

run();
