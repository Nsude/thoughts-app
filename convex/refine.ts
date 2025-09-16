import { v } from "convex/values";
import { action } from "./_generated/server";
import { GeminiResponse } from "./audio";

export const exampleSlateOutput = `
  [
      {
        "children": [
          {
            "text": "Hello victor cambel, are you high my brother, are you good?"
          }
        ],
        "type": "paragraph"
      },
      {
        "children": [
          {
            "text": ""
          }
        ],
        "type": "paragraph"
      },
      {
        "children": [
          {
            "text": "Heading 1"
          }
        ],
        "level": 1,
        "type": "heading"
      },
      {
        "children": [
          {
            "text": ""
          }
        ],
        "level": 1,
        "type": "heading"
      },
      {
        "children": [
          {
            "text": "Heading 2"
          }
        ],
        "level": 2,
        "type": "heading"
      },
      {
        "children": [
          {
            "text": ""
          }
        ],
        "level": 2,
        "type": "heading"
      },
      {
        "children": [
          {
            "text": "Heading 3"
          }
        ],
        "level": 3,
        "type": "heading"
      },
      {
        "children": [
          {
            "text": "Hello. How are you doing today? Are you good?"
          }
        ],
        "type": "paragraph"
      },
      {
        "type": "paragraph",
        "children": [
          {
            "text": ""
          }
        ]
      },
      {
        "type": "paragraph",
        "children": [
          {
            "text": "This is a bullet-list:"
          }
        ]
      },
      {
        "type": "bullet-list",
        "children": [
          {
            "type": "list-item",
            "children": [
              {
                "text": "Item 1"
              }
            ]
          },
          {
            "type": "list-item",
            "children": [
              {
                "text": "item 2"
              }
            ]
          },
          {
            "type": "list-item",
            "children": [
              {
                "text": "item 3"
              }
            ]
          }
        ]
      },
      {
        "type": "paragraph",
        "children": [
          {
            "text": ""
          }
        ]
      },
      {
        "type": "paragraph",
        "children": [
          {
            "text": "This is a numbered-list:"
          }
        ]
      },
      {
        "type": "numbered-list",
        "children": [
          {
            "type": "list-item",
            "children": [
              {
                "text": "items 1"
              }
            ]
          },
          {
            "type": "list-item",
            "children": [
              {
                "text": "item 2"
              }
            ]
          },
          {
            "type": "list-item",
            "children": [
              {
                "text": "item 3"
              }
            ]
          }
        ]
      },
      {
        "type": "paragraph",
        "children": [
          {
            "text": ""
          }
        ]
      },
      {
        "type": "paragraph",
        "children": [
          {
            "text": "this is a code block"
          }
        ]
      },
      {
        "type": "code",
        "children": [
          {
            "text": "<div>"
          }
        ]
      },
      {
        "type": "code",
        "children": [
          {
            "text": "   this is how a code block looks"
          }
        ]
      },
      {
        "type": "code",
        "children": [
          {
            "text": "</div>"
          }
        ]
      }
    ]
`;

export const formatingGuideLines = `
    - Use heading (level: 2) for main sections
    - Use bold only for critical terms or key metrics
    - Use bullet lists for challenges, solutions, or opportunities
    - Always add empty paragraph after lists
    - Use heading (level: 3) for things like solutions, implemetation details, "scaling opportunities", potential drawbacks, and any other thing that would come off a title
    - Use italic for intriguing considerations or "what if" scenarios
    - Do not add spacing after heading if what follows the heading block is a list
    - Do not use **something**
    - Do not use underscores, em dashes, or en dashes, only hyphens when absolutely necessary
`;

export const slateFormatRules = `
  - Each block is an object with "type" and "children" properties
  - Text nodes have a "text" property and optional formatting marks
  - Available block types: "paragraph", "heading", "bullet-list", "numbered-list", "list-item", "code"
  - Heading block types should have a "level" property of either 1, 2 or 3
  - Available text marks: "bold", "italic", "highlight", "linethrough", "underline"
  - List items must be wrapped in their respective list containers
  - Add empty paragraphs after lists and before headings for visual spacing
`;

export const refineThought = action({
  args: { userIdea: v.string() },
  handler: async (ctx, { userIdea }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API key");

    const prompt = `You are an idea refinement assistant that takes raw user ideas and develops them into well-structured, critical analyses in Slate.js format,
    you are also allowed to edit the idea, or offer pivot opportunities but not entirely change the idea.

    INPUT: A user's initial idea or concept
    OUTPUT: Valid JSON representing Slate.js nodes with refined idea analysis

    SLATE.JS FORMAT RULES: ${slateFormatRules}

    CONTENT STRUCTURE:
    1. Start with a refined version of the core idea
    2. Expand on the concept with practical details
    3. List potential drawbacks or challenges
    4. Provide solutions or workarounds for each challenge
    5. Identify scaling opportunities or growth paths

    TONE AND APPROACH:
    - Write as if developing your own idea, not giving advice
    - Be direct and critical in analysis
    - Keep explanations concise and actionable
    - Use bold sparingly - only for truly important details
    - Focus on viability and practical implementation
    - No need to provide a title, just go straight to your analysis

    FORMATTING GUIDELINES: ${formatingGuideLines}

    EXAMPLE OUTPUT:${exampleSlateOutput}

    USER IDEA TO REFINE:
    "${userIdea}"

    Refine and expand this idea with critical analysis. Return ONLY the JSON array, no explanations.`;

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
            maxOutputTokens: 2048, // max character limit
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

    if (!cleanedText) throw new Error("Refined text is invalid");

    return JSON.parse(cleanedText);
  },
});

export const surpriseMe = action({
  args: { keyPhrase: v.string() },
  handler: async (ctx, { keyPhrase }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API key");

    const prompt = `You are a creative idealist who generates fascinating, doable ideas across any domain imaginable. Your role is to spark curiosity and present concepts that are both innovative and achievable.

    OUTPUT: Valid JSON representing Slate.js nodes with a complete creative idea

    SLATE.JS FORMAT RULES: ${slateFormatRules}

    KEYWORD INPUT: You will receive a single keyPhrase that must be the central focus of your idea generation.

    CREATIVE APPROACH:
    - Build the entire concept around the provided keyPhrase
    - Find unexpected angles or applications for the keyPhrase
    - Connect the keyPhrase to practical, achievable solutions
    - Think beyond obvious interpretations - be creative with connections

    CONTENT STRUCTURE:
    1. Present the core idea with enthusiasm
    2. Explain why this concept is compelling
    3. Detail practical implementation steps
    4. Address realistic challenges
    5. Explore creative possibilities and extensions

    CREATIVE GUIDELINES:
    - Generate completely random ideas across different domains
    - Balance innovation with feasibility
    - Write with genuine excitement about the concept
    - Include unexpected connections or unique angles
    - Make ideas specific enough to be actionable
    - Use bold only for key breakthrough moments or critical elements
    - Keep tone inspiring but grounded

    FORMATTING GUIDELINES: ${formatingGuideLines}

    EXAMPLE OUTPUT:${exampleSlateOutput}
    KEYWORD TO DEVELOP: "${keyPhrase}"

    Generate a completely random, creative idea that's both fascinating and achievable. Make it specific and compelling. Return ONLY the JSON array, no explanations.`;

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
            maxOutputTokens: 2048, // max character limit
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

    if (!cleanedText) throw new Error("surpriseMe text is invalid");

    return JSON.parse(cleanedText);
  },
});