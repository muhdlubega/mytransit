import { Mistral } from "@mistralai/mistralai";

export const maxDuration = 60;

interface RequestBody {
  message: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
}

export async function POST(request: any) {
  try {
    const body: RequestBody = await request.json();
    const { message, location } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });

    // Build context with user location if available
    let systemPrompt = `You are a helpful travel assistant for MyTransit app in Malaysia. Help users find places and provide directions.
    
When users ask for places (petrol stations, restaurants, etc.), respond with:
1. A brief friendly message
2. A JSON array of place suggestions with this exact format:
{
  "message": "your friendly response here",
  "suggestions": [
    {
      "name": "Place Name",
      "address": "Full address in Malaysia",
      "lat": latitude as number,
      "lng": longitude as number,
      "type": "category like 'Petrol Station', 'Restaurant', etc"
    }
  ]
}

IMPORTANT: Always return valid JSON with both message and suggestions fields. For Malaysian locations, use realistic coordinates (Malaysia is roughly 1°N to 7°N, 100°E to 120°E).`;

    if (location) {
      systemPrompt += `\n\nUser's current location: ${location.lat}, ${location.lng}. Use this to suggest nearby places.`;
    }

    const chatResponse = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    const responseText = chatResponse.choices?.[0]?.message?.content || "";

    // Try to parse JSON response
    try {
      const jsonMatch = (responseText as string).match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      // If JSON parsing fails, return as plain message
    }

    // Fallback: return as plain message
    return new Response(
      JSON.stringify({
        message: responseText,
        suggestions: [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
