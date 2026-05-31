/**
 * AI Search Feature - Usage Examples
 * 
 * This file demonstrates how to test and use the AI search feature.
 * Run these examples to verify the integration is working correctly.
 */

// ============================================
// 1. Using cURL (Command Line)
// ============================================

/**
 * Basic search query
 * 
 * curl -X POST http://localhost:5000/api/products/ai-search \
 *   -H "Content-Type: application/json" \
 *   -d '{"query": "blue running shoes for women"}'
 */

/**
 * Advanced search query
 * 
 * curl -X POST http://localhost:5000/api/products/ai-search \
 *   -H "Content-Type: application/json" \
 *   -d '{"query": "affordable winter jackets under 100 dollars"}'
 */

// ============================================
// 2. Using JavaScript/Node.js
// ============================================

// Option A: Using fetch (Frontend/Modern Node.js)
async function searchProductsWithFetch(query) {
    try {
        const response = await fetch('http://localhost:5000/api/products/ai-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Search Results:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Option B: Using axios (Requires: npm install axios)
import axios from 'axios';

async function searchProductsWithAxios(query) {
    try {
        const { data } = await axios.post(
            'http://localhost:5000/api/products/ai-search',
            { query }
        );

        console.log('Search Results:', data);
        return data;
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        throw error;
    }
}

// Option C: Direct server-side usage (Backend)
import { generateKeywords } from '../services/aiSearch.js';
import Product from '../models/Product.js';

async function aiSearchBackend(query) {
    try {
        // Generate keywords
        const keywords = await generateKeywords(query);
        console.log('Extracted keywords:', keywords);

        // Find matching products
        const products = await Product.find({
            $or: [
                { name: { $regex: keywords.join('|'), $options: 'i' } },
                { category: { $regex: keywords.join('|'), $options: 'i' } },
                { description: { $regex: keywords.join('|'), $options: 'i' } }
            ]
        });

        return {
            keywords,
            productsFound: products.length,
            products
        };
    } catch (error) {
        console.error('Backend search error:', error);
        throw error;
    }
}

// ============================================
// 3. Usage Examples
// ============================================

// Example 1: Simple product search
async function example1() {
    console.log('\n=== Example 1: Simple Product Search ===');
    const result = await searchProductsWithFetch('black leather jacket');
    console.log(`Found ${result.productsFound} products`);
    console.log('Keywords:', result.keywords);
}

// Example 2: Price-aware search
async function example2() {
    console.log('\n=== Example 2: Price-Aware Search ===');
    const result = await searchProductsWithFetch('affordable running shoes under 80 dollars');
    console.log(`Found ${result.productsFound} products`);
    console.log('Keywords:', result.keywords);
}

// Example 3: Category search
async function example3() {
    console.log('\n=== Example 3: Category Search ===');
    const result = await searchProductsWithFetch('winter sports equipment for kids');
    console.log(`Found ${result.productsFound} products`);
    console.log('Keywords:', result.keywords);
}

// Example 4: Error handling
async function example4() {
    console.log('\n=== Example 4: Error Handling ===');
    try {
        // Empty query should fail
        const result = await searchProductsWithFetch('');
    } catch (error) {
        console.log('Caught expected error:', error.message);
    }
}

// ============================================
// 4. Test Suite
// ============================================

async function runAllTests() {
    console.log('Starting AI Search Tests...\n');

    const testQueries = [
        'red winter coats',
        'comfortable walking shoes for seniors',
        'affordable fitness equipment',
        'luxury designer handbags',
        'kids sports accessories',
        'professional camera equipment',
        'eco-friendly clothing'
    ];

    for (const query of testQueries) {
        try {
            console.log(`\nSearching for: "${query}"`);
            const result = await searchProductsWithFetch(query);
            console.log(`✓ Keywords: ${result.keywords.join(', ')}`);
            console.log(`✓ Found: ${result.productsFound} products`);
        } catch (error) {
            console.error(`✗ Error: ${error.message}`);
        }
    }

    console.log('\n=== Tests Complete ===');
}

// ============================================
// 5. Response Examples
// ============================================

/**
 * Success Response Example:
 * 
 * {
 *   "success": true,
 *   "query": "blue running shoes",
 *   "keywords": ["blue", "running", "shoes"],
 *   "productsFound": 5,
 *   "products": [
 *     {
 *       "_id": "507f1f77bcf86cd799439011",
 *       "name": "Blue Nike Running Shoes",
 *       "category": "Sports",
 *       "price": 89.99,
 *       "description": "Professional blue running shoes...",
 *       "ratings": 4.5
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * Error Response Example:
 * 
 * {
 *   "error": "Invalid API key",
 *   "hint": "For local model: ensure @xenova/transformers is installed..."
 * }
 */

// ============================================
// 6. Testing Configuration
// ============================================

/**
 * To switch between OpenAI API and Local Model:
 * 
 * In .env file:
 * - USE_LOCAL_MODEL=false  // Use OpenAI API (default)
 * - USE_LOCAL_MODEL=true   // Use local Transformers model
 * 
 * Restart server after changing:
 * npm start
 */

// ============================================
// 7. Performance Monitoring
// ============================================

async function searchWithMetrics(query) {
    const startTime = Date.now();

    try {
        const result = await searchProductsWithFetch(query);
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`\n📊 Performance Metrics:`);
        console.log(`   Query Time: ${duration}ms`);
        console.log(`   Keywords Extracted: ${result.keywords.length}`);
        console.log(`   Products Found: ${result.productsFound}`);
        console.log(`   Average Product: ${(duration / result.productsFound).toFixed(2)}ms`);

        return result;
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// ============================================
// Export for use in other modules
// ============================================

export {
    searchProductsWithFetch,
    searchProductsWithAxios,
    aiSearchBackend,
    runAllTests,
    searchWithMetrics,
    example1,
    example2,
    example3,
    example4
};

// Uncomment to run tests automatically
// runAllTests();
