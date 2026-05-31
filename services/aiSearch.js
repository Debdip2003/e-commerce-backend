import OpenAI from "openai";

// Initialize OpenAI client
const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


// ============================================
// 1. Rule-Based Keyword Extraction (Local)
// ============================================
export async function generateSearchKeywords(query) {
    try {
        console.log("Extracting keywords from query:", query);
        
        // Use rule-based keyword extraction (more reliable than text-generation models)
        const keywords = extractKeywordsRuleBased(query);
        
        if (keywords.length === 0) {
            throw new Error("No keywords could be extracted from query");
        }
        
        console.log("Successfully extracted keywords:", keywords);
        return keywords;
    } catch (error) {
        console.error("Error generating keywords with local method:", error);
        throw error;
    }
}

// ============================================
// Rule-Based Keyword Extraction (More Reliable)
// ============================================

function extractKeywordsRuleBased(query) {
    // Common English stopwords to filter out
    const stopwords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
        'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
        'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
        'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
        'only', 'own', 'same', 'so', 'than', 'too', 'very', 'as', 'if',
        'just', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
        'am', 'under', 'over', 'about', 'above', 'below', 'between',
        'during', 'before', 'after', 'up', 'down', 'out', 'off', 'over',
        'under', 'again', 'further', 'then', 'there', 'here', 'please'
    ]);

    // Remove punctuation and convert to lowercase
    let cleanQuery = query.replace(/[^\w\s]/g, ' ').toLowerCase();
    
    // Split into words
    let words = cleanQuery.split(/\s+/).filter(word => word.length > 0);
    
    // Filter out stopwords and very short words
    let keywords = words.filter(word => 
        !stopwords.has(word) && word.length > 2
    );
    
    // Remove duplicates while preserving order
    keywords = [...new Set(keywords)];
    
    // Limit to top 5 keywords
    keywords = keywords.slice(0, 5);
    
    return keywords;
}

// ============================================
// 2. OpenAI API Keyword Generation
// ============================================

export async function generateSearchKeywordsViaAPI(query) {
    try {
        const completion = await openaiClient.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an ecommerce AI search assistant.
Extract important search keywords from the user's query.
Return JSON only in this exact format:
{
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`
                },
                {
                    role: "user",
                    content: query
                }
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        const aiResponse = completion.choices[0].message.content;
        console.log("OpenAI Response:", aiResponse);
        
        const parsed = JSON.parse(aiResponse);
        return parsed.keywords || [];
    } catch (error) {
        console.error("Error generating keywords via OpenAI API:", error);
        throw error;
    }
}

// ============================================
// 3. Smart Keyword Generation with Fallback
// ============================================
// Uses rule-based extraction by default (no API quota issues)
// Falls back to OpenAI API if local method fails
// Can switch modes via USE_LOCAL_MODEL env variable

export async function generateKeywords(query) {
    const useLocalModel = process.env.USE_LOCAL_MODEL === "true";
    
    if (useLocalModel) {
        console.log("Using local Transformers.js model...");
        try {
            return await generateSearchKeywords(query);
        } catch (error) {
            console.error("Local model failed:", error.message);
            console.log("Attempting fallback to OpenAI API...");
            try {
                return await generateSearchKeywordsViaAPI(query);
            } catch (apiError) {
                throw new Error(`Both methods failed. Local: ${error.message}. API: ${apiError.message}`);
            }
        }
    } else {
        console.log("Using OpenAI API...");
        try {
            return await generateSearchKeywordsViaAPI(query);
        } catch (apiError) {
            console.error("OpenAI API failed:", apiError.message);
            
            // Check if it's a quota error
            if (apiError.code === 'insufficient_quota' || apiError.status === 429) {
                console.warn("⚠️  OpenAI quota exceeded! Falling back to local model...");
                console.log("💡 Tip: Set USE_LOCAL_MODEL=true in .env to use local model by default and avoid quota issues");
                try {
                    return await generateSearchKeywords(query);
                } catch (localError) {
                    throw new Error(`OpenAI quota exceeded and local model unavailable. Install @xenova/transformers or add billing to OpenAI.`);
                }
            }
            throw apiError;
        }
    }
}
