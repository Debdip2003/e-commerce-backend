# GPT OSS 20B AI Search Integration Guide

## Overview

The AI search feature uses GPT OSS 20B to extract keywords from user queries and find relevant products. There are two approaches:

1. **OpenAI API (Default)** - Fast, cloud-based, no GPU required
2. **Local Model (Transformers)** - Privacy-focused, runs locally, requires GPU

## Default Setup: OpenAI API (Recommended)

### What's Required
- OpenAI API key (already configured in `.env`)
- No additional dependencies needed

### How It Works
```
User Query → OpenAI API → Extract Keywords → Search Products
```

### Usage
```bash
curl -X POST http://localhost:5000/api/products/ai-search \
  -H "Content-Type: application/json" \
  -d '{"query": "blue running shoes for women"}'
```

### Response
```json
{
  "success": true,
  "query": "blue running shoes for women",
  "keywords": ["blue", "running", "shoes", "women"],
  "productsFound": 5,
  "products": [...]
}
```

## Optional: Local GPT OSS 20B Model (Transformers)

### Requirements

**Hardware:**
- GPU with at least 8GB VRAM (RTX 2080 or better recommended)
- 16GB+ system RAM

**Software:**
```bash
# Install CUDA Toolkit (for NVIDIA GPUs)
# Visit: https://developer.nvidia.com/cuda-downloads

# Install PyTorch with CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install transformers library
pip install transformers

# Or install all at once
pip install torch transformers accelerate
```

### Configuration

1. **Install Dependencies**
   ```bash
   npm install  # or add to package.json if needed
   ```

2. **Update .env**
   ```env
   USE_LOCAL_MODEL=true
   ```

3. **Restart Server**
   The model will download (~40GB) on first run

### Performance Considerations

| Metric | OpenAI API | Local Model |
|--------|-----------|------------|
| Speed | 1-2 seconds | 2-5 seconds (GPU) |
| Cost | $0.001-0.002 per request | One-time download |
| Privacy | Cloud-based | Local only |
| Setup | Instant | Complex (GPU setup) |
| Resource Usage | None | GPU/CPU intensive |

## API Endpoint

### POST `/api/products/ai-search`

**Request:**
```json
{
  "query": "string (required)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "query": "original query",
  "keywords": ["keyword1", "keyword2"],
  "productsFound": 5,
  "products": [
    {
      "_id": "...",
      "name": "...",
      "category": "...",
      "description": "...",
      "price": 0
    }
  ]
}
```

**Response (Error):**
```json
{
  "error": "error message",
  "hint": "setup advice if applicable"
}
```

## Troubleshooting

### OpenAI API Issues
- **"Invalid API Key"**: Check `OPENAI_API_KEY` in `.env`
- **"Rate Limit"**: Wait a moment and retry, or upgrade API plan
- **"Model not found"**: Verify API key has access to gpt-3.5-turbo

### Local Model Issues
- **"torch not found"**: Install PyTorch: `pip install torch`
- **"Out of memory"**: Your GPU doesn't have enough VRAM
- **"Model download stuck"**: Check internet connection, retry
- **"CUDA not available"**: Install NVIDIA CUDA Toolkit

### General
- Check server logs for detailed error messages
- Ensure MongoDB connection is working
- Verify query parameter is not empty

## Code Example (Frontend)

```javascript
// Using fetch
async function searchProducts(query) {
  const response = await fetch('http://localhost:5000/api/products/ai-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return response.json();
}

// Using axios
import axios from 'axios';

async function searchProducts(query) {
  const { data } = await axios.post(
    'http://localhost:5000/api/products/ai-search',
    { query }
  );
  return data;
}
```

## Switching Between Methods

```javascript
// In config/.env
USE_LOCAL_MODEL=false  // Use OpenAI API (default)
USE_LOCAL_MODEL=true   // Use local Transformers model
```

The code automatically switches based on this setting.

## Security Notes

1. **API Key Protection**: Keep `OPENAI_API_KEY` secret
2. **Environment Variables**: Store in `.env`, don't commit to git
3. **Rate Limiting**: Consider adding rate limiting for production
4. **Data Privacy**: Local model keeps data on your server

## File Structure

```
services/
  └── aiSearch.js           # AI search logic (both methods)
routes/
  └── Product.js            # Updated AI search endpoint
.env                        # Configuration (API key + mode)
```

## Cost Estimation (OpenAI API)

- Average query: $0.001-0.002
- 1000 searches/month: $1-2
- See [OpenAI Pricing](https://openai.com/pricing)

## Next Steps

1. ✅ Integration is complete
2. Test with curl or Postman
3. Monitor logs for first few requests
4. Adjust system prompts if needed
5. Consider adding caching for popular queries

---

**Last Updated**: May 31, 2026
