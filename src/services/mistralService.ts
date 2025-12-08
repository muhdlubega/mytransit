export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PlaceSuggestion {
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
}

export interface MistralResponse {
  suggestions: PlaceSuggestion[];
  message: string;
}

function getMockSuggestions(
  query: string,
  location: { lat: number; lng: number } | null
): MistralResponse {
  const lowerQuery = query.toLowerCase();

  // Default location: Kuala Lumpur area
  const baseLat = location?.lat || 3.139;
  const baseLng = location?.lng || 101.6869;

  if (lowerQuery.includes("petrol") || lowerQuery.includes("gas")) {
    return {
      message: "Here are some nearby petrol stations:",
      suggestions: [
        {
          name: "Petronas",
          address: "Jalan Sultan Azlan Shah, Kuala Lumpur",
          lat: baseLat + 0.01,
          lng: baseLng + 0.01,
          type: "petrol_station",
        },
        {
          name: "Shell",
          address: "Jalan Tun Razak, Kuala Lumpur",
          lat: baseLat - 0.01,
          lng: baseLng + 0.015,
          type: "petrol_station",
        },
        {
          name: "Caltex",
          address: "Jalan Ampang, Kuala Lumpur",
          lat: baseLat + 0.015,
          lng: baseLng - 0.01,
          type: "petrol_station",
        },
      ],
    };
  }

  if (
    lowerQuery.includes("halal") ||
    lowerQuery.includes("restaurant") ||
    lowerQuery.includes("food")
  ) {
    return {
      message: "Here are some halal restaurants nearby:",
      suggestions: [
        {
          name: "Nasi Kandar Pelita",
          address: "Jalan Ampang, Kuala Lumpur",
          lat: baseLat + 0.02,
          lng: baseLng + 0.02,
          type: "restaurant",
        },
        {
          name: "Sushi King",
          address: "Pavilion KL, Bukit Bintang",
          lat: baseLat + 0.01,
          lng: baseLng - 0.01,
          type: "restaurant",
        },
        {
          name: "The Chicken Rice Shop",
          address: "Mid Valley Megamall, Kuala Lumpur",
          lat: baseLat - 0.02,
          lng: baseLng + 0.01,
          type: "restaurant",
        },
      ],
    };
  }

  return {
    message: "Here are some popular places:",
    suggestions: [
      {
        name: "KLCC Park",
        address: "Kuala Lumpur City Centre",
        lat: 3.1537,
        lng: 101.7119,
        type: "park",
      },
      {
        name: "Pavilion KL",
        address: "Bukit Bintang, Kuala Lumpur",
        lat: 3.1495,
        lng: 101.7133,
        type: "shopping_mall",
      },
    ],
  };
}

export async function chatWithMistral(
  userMessage: string,
  userLocation: { lat: number; lng: number } | null
): Promise<MistralResponse> {
  try {
    const apiKey = process.env.REACT_APP_MISTRAL_API_KEY;

    if (!apiKey) {
      console.warn("Mistral API key not found. Using mock response.");
      return getMockSuggestions(userMessage, userLocation);
    }

    const systemPrompt = userLocation
      ? `You are a helpful local assistant in Malaysia. The user is currently at coordinates: ${userLocation.lat}, ${userLocation.lng}. 
             Provide relevant place suggestions based on their location. 
             Format your response as JSON with this EXACT structure:
             {
               "message": "A helpful response message",
               "suggestions": [
                 {
                   "name": "Place Name",
                   "address": "Full address in Malaysia",
                   "lat": latitude_number,
                   "lng": longitude_number,
                   "type": "restaurant|petrol_station|cafe|etc"
                 }
               ]
             }
             Provide 3-5 real suggestions with actual coordinates in Malaysia.`
      : `You are a helpful assistant in Malaysia. Provide place suggestions based on the user's request.
             Format your response as JSON with the structure shown above. Use real places in Malaysia.`;

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("Mistral API error:", response.statusText);
      return getMockSuggestions(userMessage, userLocation);
    }

    const data = await response.json();
    console.log("[v0] Mistral API response:", data);

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in Mistral response");
      return getMockSuggestions(userMessage, userLocation);
    }

    try {
      const parsed = JSON.parse(content);
      console.log("[v0] Parsed Mistral response:", parsed);

      // Handle both formats: {suggestions: [...]} and {places: [...]}
      const suggestions = parsed.suggestions || parsed.places || [];

      return {
        message:
          parsed.message || parsed.note || "Here are some suggestions for you:",
        suggestions: suggestions.map((place: any) => ({
          name: place.name,
          address: place.address,
          lat: place.lat || place.latitude || 0,
          lng: place.lng || place.longitude || 0,
          type: place.type || "place",
        })),
      };
    } catch (parseError) {
      console.error(
        "Error parsing Mistral response:",
        parseError,
        "Content:",
        content
      );
      return getMockSuggestions(userMessage, userLocation);
    }
  } catch (error) {
    console.error("Error calling Mistral API:", error);
    return getMockSuggestions(userMessage, userLocation);
  }
}
