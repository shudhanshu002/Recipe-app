import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getChatResponse = asyncHandler(async (req, res) => {
    const { message, context } = req.body;

    if (!message) {
        throw new ApiError(400, 'Message is required');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash', // ✅ FREE & FAST
            systemInstruction: `
You are "ZaikaBot", a master chef assistant.
Answer questions about cooking, recipes, and ingredients.
Keep answers detailed.
${context ? `Context: User is viewing: ${JSON.stringify(context)}` : ''}
      `,
        });

        const result = await model.generateContent(message);
        const reply = result.response.text();

        return res.status(200).json(new ApiResponse(200, { reply }, 'AI Response fetched'));
    } catch (error) {
        console.error('Gemini Error:', error);
        throw new ApiError(500, 'AI service unavailable');
    }
});

export { getChatResponse };
