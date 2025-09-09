import { v } from "convex/values";
import { action, mutation } from "./_generated/server";

interface TranscribeParams {
  audio_url: string;
  speech_model: "universal" | "universal-2";
  language_detection?: boolean;
  punctuate?: boolean;
  format_text?: boolean;
}

interface TranscribedResponse {
  id: string;
  status: "queued" | "processing" | "completed" | "error";
  text: string | null;
  confidence?: number;
  audio_duration?: number;
  error?: string;
}

export const transcribeAudio = action({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Audio does not exist in storage");

    const apiKey = process.env.ASSEMBLY_AI_API_KEY;
    if (!apiKey) throw new Error("Missing AssemblyAI API key");

    const params: TranscribeParams = {
      audio_url: url,
      speech_model: "universal",
      format_text: true,
      language_detection: true,
      punctuate: true,
    };

    const baseUrl = "https://api.assemblyai.com/v2/transcript";

    // submit a transcription request to assembly ai
    const submitResponse = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!submitResponse.ok) {
      throw new Error("Transcription request failed");
    }

    const submitData = (await submitResponse.json()) as TranscribedResponse;

    // get the actual transcript when ready or throw error if fail
    let transcriptInstance = submitData;
    let attempts = 0;
    const maxAttempts = 15; // try for 2.5 min
    while (
      transcriptInstance.status === "queued" ||
      transcriptInstance.status === "processing"
    ) {
      if (attempts >= maxAttempts)
        throw new Error("Audio transcription failed");

      await new Promise((resolve) => setTimeout(resolve, 10000)); // delay for 10s

      const transcriptData = await fetch(
        `${baseUrl}/${transcriptInstance.id}`,
        {
          headers: { Authorization: apiKey },
        }
      );

      if (!transcriptData.ok) {
        throw new Error("Error fetching transcribed audio");
      }

      transcriptInstance = (await transcriptData.json()) as TranscribedResponse;
      attempts++;
    }

    const slateVersion = await ctx.runAction("audio:convertTranscriptionToSlate" as any, 
      {
        transcription: transcriptInstance.text,
      }
    )

    return slateVersion;
  },
});

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const convertTranscriptionToSlate = action({
  args: {
    transcription: v.string(),
    thoughtContext: v.optional(v.string()), // Optional context about what kind of thought this is
  },
  handler: async (ctx, { transcription, thoughtContext = "" }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API key");

    const prompt = `You are a text processing assistant that converts raw speech transcriptions into well-structured Slate.js content.
      INPUT: Raw transcription from speech-to-text
      OUTPUT: Valid JSON representing Slate.js nodes

      SLATE.JS FORMAT RULES:
      - Each block is an object with "type" and "children" properties
      - Text nodes have a "text" property and optional formatting marks
      - Available block types: "paragraph", "heading-1", "heading-2", "heading-3", "bullet-list", "numbered-list", "list-item", "code"
      - Available text marks: "bold", "italic", "highlight", "linethrough", "underline"
      - List items must be wrapped in their respective list containers

      FORMATTING DECISIONS:
      - Use headings for main topics or sections
      - Use bold for emphasis or key terms
      - Use italic for thoughts, quotes, or subtle emphasis  
      - Use highlight for important points or action items
      - Use bullet lists for unordered items/ideas
      - Use numbered lists for steps or sequential items
      - Use code blocks for technical content, code, or structured data

      EXAMPLE OUTPUT:
      [
        {
          "type": "heading-2",
          "children": [{"text": "Project Ideas"}]
        },
        {
          "type": "paragraph", 
          "children": [
            {"text": "I've been thinking about "},
            {"text": "building a voice app", "bold": true},
            {"text": " that could help people organize their thoughts better."}
          ]
        },
        {
          "type": "bulleted-list",
          "children": [
            {
              "type": "list-item",
              "children": [{"text": "Voice recording feature"}]
            },
            {
              "type": "list-item", 
              "children": [{"text": "AI transcription and formatting"}]
            }
          ]
        }
      ]

      CONTEXT: ${thoughtContext}

      TRANSCRIPTION TO CONVERT:
      "${transcription}"

      Convert this transcription into structured Slate.js content. Focus on making it readable and well-organized. Return ONLY the JSON array, no explanations.`;

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
          apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3, // Lower temperature for more consistent formatting
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || !data.candidates[0]) {
        throw new Error("No response from Gemini");
      }

      const generatedText = data.candidates[0].content.parts[0].text;

      // Clean up the response (remove markdown code blocks if present)
      const cleanedText = generatedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      try {
        // Parse and validate the JSON
        const slateContent = JSON.parse(cleanedText);

        // Basic validation - ensure it's an array
        if (!Array.isArray(slateContent)) {
          throw new Error("Generated content is not a valid Slate array");
        }

        return slateContent;
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", cleanedText);

        // Fallback: create a simple paragraph with the transcription
        return [
          {
            type: "paragraph",
            children: [{ text: transcription }],
          },
        ];
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      // Fallback: return transcription as plain paragraph
      return [
        {
          type: "paragraph",
          children: [{ text: transcription }],
        },
      ];
    }
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
