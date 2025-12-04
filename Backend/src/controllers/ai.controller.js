import OpenAI from 'openai';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenRouter
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'YumPlatform',
    },
});

const getChatResponse = asyncHandler(async (req, res) => {
    const { message, context } = req.body;

    if (!message) {
        throw new ApiError(400, 'Message is required');
    }

    // List of Free Models to try (In order of preference)
    const models = [
        'x-ai/grok-4.1-fast:free',
        'google/gemini-2.0-flash-exp:free', // 1. Best quality (often busy)
        'meta-llama/llama-3-8b-instruct:free', // 2. Very fast & stable
        'mistralai/mistral-7b-instruct:free', // 3. Reliable fallback
        'microsoft/phi-3-mini-128k-instruct:free', // 4. Lightweight fallback
    ];

    let reply = '';
    let success = false;

    // Try models one by one
    for (const model of models) {
        try {
            console.log(`🤖 YumBot: Trying model '${model}'...`);

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `You are 'YumBot', a master chef assistant. 
                        Answer questions about cooking, recipes, and ingredients. 
                        Keep answers detailed.
                        ${context ? `Context: User is viewing: ${JSON.stringify(context)}` : ''}`,
                    },
                    { role: 'user', content: message },
                ],
            });

            if (completion.choices && completion.choices[0]) {
                reply = completion.choices[0].message.content;
                success = true;
                console.log(`✅ Success with ${model}`);
                break; // Stop loop if successful
            }
        } catch (error) {
            console.warn(`⚠️ Failed with ${model}:`, error.status || error.message);
            // Loop continues to next model...
        }
    }

    if (!success) {
        return res.status(200).json(new ApiResponse(200, { reply: 'All my chefs are busy right now! Please try again in a minute.' }, 'AI Error'));
    }

    return res.status(200).json(new ApiResponse(200, { reply }, 'AI Response fetched'));
});

export { getChatResponse };
