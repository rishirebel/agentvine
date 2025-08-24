# AgentVine TypeScript SDK

The official TypeScript SDK for seamlessly integrating AgentVine's AI-powered offer matching into your applications. Monetize your AI agents by connecting them with relevant sponsored content and advertising opportunities.

## 🚀 Features

- **Type-Safe Integration** - Full TypeScript support with comprehensive type definitions
- **AI-Powered Matching** - Smart offer matching based on user queries and context
- **Secure Authentication** - Agent-based authentication with secure credential management
- **Framework Agnostic** - Works with any JavaScript/TypeScript framework
- **Lightweight** - Minimal dependencies with efficient performance

## 📦 Installation

```bash
# npm
npm install agentvine

# yarn  
yarn add agentvine

# pnpm
pnpm add agentvine
```

## ⚡ Quick Start

```typescript
import { AgentVineClient } from 'agentvine';

// Initialize with your agent credentials from the dashboard
const client = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key'
});

// Get relevant offers for user queries
async function handleUserQuery(userQuery: string, sessionId: string) {
  try {
    const response = await client.getOffers({
      query: userQuery,
      sessionId: sessionId,
      context: 'development platform: web'
    });
    
    // Display offers to users
    response.offers.forEach(offer => {
      console.log(`✨ ${offer.title}`);
      console.log(`📝 ${offer.description}`);
      console.log(`🔗 ${offer.callToAction} -> ${offer.actionEndpoint}`);
    });
    
    return response.offers;
  } catch (error) {
    console.error('AgentVine error:', error.message);
    return [];
  }
}

// Test your integration
client.testConnection()
  .then(result => console.log('✅ Connected to AgentVine:', result.agent?.name))
  .catch(error => console.error('❌ Connection failed:', error.message));
```

## API Reference

### AgentVineClient

#### Constructor

```typescript
new AgentVineClient(config: AgentVineConfig)
```

**Parameters:**
- `config.agentId` (string, required) - Your agent ID from AgentVine dashboard
- `config.agentSecretKey` (string, required) - Your agent secret key
- `config.timeout` (number, optional) - Request timeout in milliseconds (defaults to 10000)


#### Methods

##### getOffers(request)

Get sponsored offers for a user query.

```typescript
async getOffers(request: OfferRequest): Promise<OfferResponse>
```

**Parameters:**
- `request.query` (string, required) - The user's query or question
- `request.sessionId` (string, required) - Unique session identifier
- `request.context` (string, optional) - Additional context about the query

**Returns:**
```typescript
{
  success: boolean;
  query: string;
  sessionId: string;
  offers: Array<{
    id: number;
    title: string;
    description: string;
    callToAction: string;
    actionEndpoint: string;
    productName: string;
    productWebsite: string;
  }>;
}
```

##### testConnection()

Test your agent credentials and connection.

```typescript
async testConnection(): Promise<TestConnectionResult>
```


**Returns:**
```typescript
{
  success: boolean;
  message: string;
  agent?: {
    id: number;
    name: string;
    type: string;
    status: string;
  };
}
```

## 🎯 Integration Examples

### React Chat Application

```typescript
import React, { useState, useEffect } from 'react';
import { AgentVineClient, Offer } from 'agentvine';

const client = new AgentVineClient({
  agentId: process.env.REACT_APP_AGENTVINE_AGENT_ID!,
  agentSecretKey: process.env.REACT_APP_AGENTVINE_SECRET_KEY!
});

function ChatComponent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUserMessage = async (message: string, userId: string) => {
    setLoading(true);
    const sessionId = `chat-${userId}-${Date.now()}`;
    
    try {
      const response = await client.getOffers({
        query: message,
        sessionId,
        context: 'user assistance chat on web platform'
      });
      
      setOffers(response.offers);
      
      // Note: Impressions are automatically tracked by AgentVine
      
    } catch (error) {
      console.error('Failed to get offers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Your chat UI */}
      <div className="sponsored-offers">
        {offers.map(offer => (
          <OfferCard 
            key={offer.id} 
            offer={offer}
            onInteraction={() => {
              // Handle offer interaction
              window.open(offer.actionEndpoint, '_blank');
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Next.js API Integration

```typescript
// pages/api/agent/offers.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AgentVineClient } from 'agentvine';

const client = new AgentVineClient({
  agentId: process.env.AGENTVINE_AGENT_ID!,
  agentSecretKey: process.env.AGENTVINE_SECRET_KEY!
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, sessionId, context } = req.body;

  try {
    const offersResponse = await client.getOffers({
      query,
      sessionId,
      context: `${context} - User-Agent: ${req.headers['user-agent']}`
    });

    res.status(200).json(offersResponse);
  } catch (error) {
    console.error('AgentVine API error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve offers',
      code: error.code 
    });
  }
}
```

### Express.js + OpenAI Integration

```typescript
import express from 'express';
import { AgentVineClient } from 'agentvine';
import OpenAI from 'openai';

const app = express();
const client = new AgentVineClient({
  agentId: process.env.AGENTVINE_AGENT_ID!,
  agentSecretKey: process.env.AGENTVINE_SECRET_KEY!
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

app.post('/api/chat', async (req, res) => {
  const { message, userId } = req.body;
  const sessionId = `session-${userId}-${Date.now()}`;
  
  try {
    // Get AI response
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }]
    });

    // Get relevant sponsored offers
    const offersResponse = await client.getOffers({
      query: message,
      sessionId,
      context: 'chat user on web API using gpt-4'
    });

    // Enhanced response with AI + sponsored content
    res.json({
      aiResponse: aiResponse.choices[0].message.content,
      sponsoredOffers: offersResponse.offers,
      sessionId,
      success: true
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Chat service temporarily unavailable',
      sessionId 
    });
  }
});

app.listen(3000, () => {
  console.log('🚀 Chat API server running on port 3000');
});
```

### Vue.js Composition API

```typescript
// composables/useAgentVine.ts
import { ref } from 'vue';
import { AgentVineClient, type Offer, type OfferRequest } from 'agentvine';

const client = new AgentVineClient({
  agentId: import.meta.env.VITE_AGENTVINE_AGENT_ID,
  agentSecretKey: import.meta.env.VITE_AGENTVINE_SECRET_KEY
});

export function useAgentVine() {
  const offers = ref<Offer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getOffers = async (request: OfferRequest) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await client.getOffers(request);
      offers.value = response.offers;
      return response;
    } catch (err: any) {
      error.value = err.message;
      console.error('AgentVine error:', err);
      return { offers: [], success: false };
    } finally {
      loading.value = false;
    }
  };

  return {
    offers: readonly(offers),
    loading: readonly(loading),
    error: readonly(error),
    getOffers
  };
}
```

### Discord Bot Integration

```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { AgentVineClient } from 'agentvine';

const discordClient = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

const agentVineClient = new AgentVineClient({
  agentId: process.env.AGENTVINE_AGENT_ID!,
  agentSecretKey: process.env.AGENTVINE_SECRET_KEY!
});

discordClient.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Trigger on specific commands or keywords
  if (message.content.startsWith('!recommend') || 
      message.content.includes('need help with')) {
    
    const sessionId = `discord-${message.author.id}-${Date.now()}`;
    
    try {
      const response = await agentVineClient.getOffers({
        query: message.content,
        sessionId,
        context: `discord platform, guild: ${message.guildId}`
      });

      if (response.offers.length > 0) {
        const offer = response.offers[0];
        
        const embed = {
          title: `💡 ${offer.title}`,
          description: offer.description,
          color: 0x0099ff,
          footer: { text: 'Sponsored by AgentVine' },
          fields: [
            {
              name: '🔗 Get Started',
              value: `[${offer.callToAction}](${offer.actionEndpoint})`
            }
          ]
        };

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Discord bot AgentVine error:', error);
    }
  }
});

discordClient.login(process.env.DISCORD_TOKEN);
```

## Error Handling

The SDK throws detailed errors with specific error codes:

```javascript
try {
  const offers = await client.getOffers(request);
} catch (error) {
  switch (error.code) {
    case 'AUTH_ERROR':
      console.error('Invalid agent credentials');
      break;
    case 'TIMEOUT_ERROR':
      console.error('Request timed out');
      break;
    case 'NETWORK_ERROR':
      console.error('Network connection failed');
      break;
    default:
      console.error('Unknown error:', error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import { AgentVineClient, OfferRequest, OfferResponse } from 'agentvine';

const client = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key'
});

const request: OfferRequest = {
  query: 'How to optimize React performance?',
  sessionId: 'session-123',
  context: 'development_help'
};

const response: OfferResponse = await client.getOffers(request);
```

## Security & Privacy

- **Secure Communication**: All API calls use HTTPS and authenticated requests
- **Privacy First**: No personal user data is sent to AgentVine - only query content and session IDs

## 🔧 Configuration Options

### Basic Configuration

```typescript
// Basic client setup
const client = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key'
});

// With custom timeout
const customClient = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key',
  timeout: 15000 // 15 seconds
});
```


## 🛡 Security Best Practices

### API Key Management

```typescript
// ✅ Secure API key storage
const client = new AgentVineClient({
  agentId: process.env.AGENTVINE_AGENT_ID,
  agentSecretKey: process.env.AGENTVINE_SECRET_KEY
});

// ❌ Never hardcode keys
const badClient = new AgentVineClient({
  agentId: 'agent_1234567890abcdef', // Don't do this!
  agentSecretKey: 'sk_abcdef1234567890'
});
```

### Request Validation

```typescript
// Input sanitization
function sanitizeQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
    .substring(0, 500); // Limit query length
}

// Validate session IDs
function isValidSessionId(sessionId: string): boolean {
  return /^[a-zA-Z0-9\-_]{8,64}$/.test(sessionId);
}

// Safe API call
const safeQuery = sanitizeQuery(userInput);
const safeSessionId = isValidSessionId(sessionId) ? sessionId : generateSessionId();

const offers = await client.getOffers({
  query: safeQuery,
  sessionId: safeSessionId
});
```

## 📚 Resources and Support

### Community and Support
- **[GitHub Issues](https://github.com/rishirebel/agentvine/issues)** - Bug reports and feature requests
- **[npm Package](https://www.npmjs.com/package/agentvine)** - Latest releases

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**AgentVine TypeScript SDK** - Monetize Your AI Agents with Intelligent Sponsored Content

Built with ❤️ by the AgentVine team