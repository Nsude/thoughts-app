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
  args: {storageId: v.string()},
  handler: async (ctx, {storageId}) => {
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Audio does not exist in storage");

    const apiKey = process.env.ASSEMBLY_AI_API_KEY;
    if (!apiKey) throw new Error("Missing AssemblyAI API key");

    const params: TranscribeParams = {
      audio_url: url,
      speech_model: "universal",
      format_text: true,
      language_detection: true,
      punctuate: true
    }

    const baseUrl = "https://api.assemblyai.com/v2/transcript";

    // submit a transcription request to assembly ai
    const submitResponce = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    })

    if (!submitResponce.ok) {
      throw new Error("Transcription request failed");
    }

    const submitData = (await submitResponce.json()) as TranscribedResponse;
    
    // get the actual transcript when ready or throw error if fail
    let transcriptInstance = submitData;
    let attempts = 0
    const maxAttempts = 15; // try for 2.5 min
    while(
      transcriptInstance.status === "queued" || 
      transcriptInstance.status === "processing"
    ) {
      if (attempts >= maxAttempts) throw new Error("Audio transcription failed");

      await new Promise((resolve) => setTimeout(resolve, 10000)); // delay for 10s

      const transcriptData = await fetch(
        `${baseUrl}/${transcriptInstance.id}`,
        {
          headers: { "Authorization": apiKey }
        }
      );

      if (!transcriptData.ok) {
        throw new Error("Error fetching transcribed audio");
      }

      transcriptInstance = (await transcriptData.json()) as TranscribedResponse;
      attempts++;
    }

    return transcriptInstance.text;

  }
})

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});