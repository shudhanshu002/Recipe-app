import OpenAI from 'openai';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import dotenv from 'dotenv';

dotenv.config();
 
// Initialize OpenRouter
const openai = new OpenAI({
    baseURL: process.env.BASE_URL,
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

    const models = [
        'x-ai/grok-4.1-fast:free',
        'google/gemini-2.0-flash-exp:free', 
        'meta-llama/llama-3-8b-instruct:free', 
        'mistralai/mistral-7b-instruct:free', 
        'microsoft/phi-3-mini-128k-instruct:free', 
    ];

    let reply = '';
    let success = false;

    
    for (const model of models) {
        try {

            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `You are 'ZaikaBot', a master chef assistant. 
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
                break; 
            }
        } catch (error) {
            console.warn(`⚠️ Failed with ${model}:`, error.status || error.message);
        }
    }

    if (!success) {
        return res.status(200).json(new ApiResponse(200, { reply: 'All my chefs are busy right now! Please try again in a minute.' }, 'AI Error'));
    }

    return res.status(200).json(new ApiResponse(200, { reply }, 'AI Response fetched'));
});

export { getChatResponse };
