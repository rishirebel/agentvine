# AgentVine TypeScript SDK

The official TypeScript SDK for seamlessly integrating AgentVine's AI-powered offer matching into your applications. Monetize your AI agents by connecting them with relevant sponsored content and advertising opportunities.

## 🚀 Features

- **Type-Safe Integration** - Full TypeScript support with comprehensive type definitions
- **AI-Powered Matching** - Smart offer matching based on user queries and context
- **Real-Time Analytics** - Automatic performance tracking and revenue optimization
- **Secure Authentication** - API key-based authentication with secure token management
- **Framework Agnostic** - Works with any JavaScript/TypeScript framework
- **Zero Dependencies** - Lightweight SDK with minimal footprint

## 📦 Installation

```bash
# npm
npm install @agentvine/sdk

# yarn  
yarn add @agentvine/sdk

# pnpm
pnpm add @agentvine/sdk
```

## ⚡ Quick Start

```typescript
import { AgentVineSDK } from '@agentvine/sdk';

// Initialize with your agent credentials from the dashboard
const sdk = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key',
  // Optional: specify environment
  environment: 'production' // 'production' | 'development' | 'local'
});

// Get relevant offers for user queries
async function handleUserQuery(userQuery: string, sessionId: string) {
  try {
    const response = await sdk.getOffers({
      query: userQuery,
      sessionId: sessionId,
      context: {
        userType: 'developer',
        platform: 'web'
      }
    });
    
    // Display offers to users
    response.offers.forEach(offer => {
      console.log(`✨ ${offer.title}`);
      console.log(`📝 ${offer.description}`);
      console.log(`🔗 ${offer.callToAction} -> ${offer.actionUrl}`);
    });
    
    return response.offers;
  } catch (error) {
    console.error('AgentVine error:', error.message);
    return [];
  }
}

// Test your integration
sdk.testConnection()
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
- `config.environment` (string, optional) - Environment: 'production' (default), 'development', or 'local'
- `config.baseUrl` (string, optional) - Custom API base URL (overrides environment setting)
- `config.timeout` (number, optional) - Request timeout in milliseconds (defaults to 10000)

**Environment URLs:**
- `production`: https://api.agentvine.dev (default)
- `development`: https://dev-api.agentvine.dev  
- `local`: http://localhost:3001

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
import { AgentVineSDK, Offer } from '@agentvine/sdk';

const sdk = new AgentVineSDK({
  apiKey: process.env.REACT_APP_AGENTVINE_API_KEY!,
  secretKey: process.env.REACT_APP_AGENTVINE_SECRET_KEY!
});

function ChatComponent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUserMessage = async (message: string, userId: string) => {
    setLoading(true);
    const sessionId = `chat-${userId}-${Date.now()}`;
    
    try {
      const response = await sdk.getOffers({
        query: message,
        sessionId,
        context: { 
          userType: 'end_user',
          platform: 'web',
          chatContext: 'assistance' 
        }
      });
      
      setOffers(response.offers);
      
      // Track impression automatically handled by SDK
      await sdk.trackImpression({
        offerId: response.offers[0]?.id,
        sessionId,
        placement: 'chat_sidebar'
      });
      
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
            onInteraction={() => sdk.trackClick({
              offerId: offer.id,
              sessionId: 'current-session'
            })}
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
import { AgentVineSDK } from '@agentvine/sdk';

const sdk = new AgentVineSDK({
  apiKey: process.env.AGENTVINE_API_KEY!,
  secretKey: process.env.AGENTVINE_SECRET_KEY!,
  environment: process.env.NODE_ENV as 'development' | 'production'
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
    const offersResponse = await sdk.getOffers({
      query,
      sessionId,
      context: {
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer,
        ...context
      }
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
import { AgentVineSDK } from '@agentvine/sdk';
import OpenAI from 'openai';

const app = express();
const sdk = new AgentVineSDK({
  apiKey: process.env.AGENTVINE_API_KEY!,
  secretKey: process.env.AGENTVINE_SECRET_KEY!
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
    const offersResponse = await sdk.getOffers({
      query: message,
      sessionId,
      context: {
        userType: 'chat_user',
        platform: 'web_api',
        aiModel: 'gpt-4'
      }
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
import { ref, reactive } from 'vue';
import { AgentVineSDK, type Offer, type GetOffersRequest } from '@agentvine/sdk';

const sdk = new AgentVineSDK({
  apiKey: import.meta.env.VITE_AGENTVINE_API_KEY,
  secretKey: import.meta.env.VITE_AGENTVINE_SECRET_KEY
});

export function useAgentVine() {
  const offers = ref<Offer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getOffers = async (request: GetOffersRequest) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await sdk.getOffers(request);
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

  const trackInteraction = async (offerId: number, type: 'impression' | 'click') => {
    try {
      if (type === 'impression') {
        await sdk.trackImpression({ offerId, sessionId: 'current' });
      } else {
        await sdk.trackClick({ offerId, sessionId: 'current' });
      }
    } catch (err) {
      console.error('Tracking error:', err);
    }
  };

  return {
    offers: readonly(offers),
    loading: readonly(loading),
    error: readonly(error),
    getOffers,
    trackInteraction
  };
}
```

### Discord Bot Integration

```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { AgentVineSDK } from '@agentvine/sdk';

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

const sdk = new AgentVineSDK({
  apiKey: process.env.AGENTVINE_API_KEY!,
  secretKey: process.env.AGENTVINE_SECRET_KEY!
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Trigger on specific commands or keywords
  if (message.content.startsWith('!recommend') || 
      message.content.includes('need help with')) {
    
    const sessionId = `discord-${message.author.id}-${Date.now()}`;
    
    try {
      const response = await sdk.getOffers({
        query: message.content,
        sessionId,
        context: {
          platform: 'discord',
          guildId: message.guildId,
          channelType: message.channel.type
        }
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
              value: `[${offer.callToAction}](${offer.actionUrl})`
            }
          ]
        };

        await message.reply({ embeds: [embed] });
        
        // Track impression
        await sdk.trackImpression({
          offerId: offer.id,
          sessionId,
          placement: 'discord_message'
        });
      }
    } catch (error) {
      console.error('Discord bot AgentVine error:', error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
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

- **Automatic Tracking**: User impressions and clicks are tracked automatically by AgentVine when offers are displayed and interacted with
- **No Manual Reporting**: The SDK does not expose manual impression tracking to prevent fraud
- **Secure Communication**: All API calls use HTTPS and authenticated requests
- **Privacy First**: No personal user data is sent to AgentVine - only query content and session IDs

## 🔧 Configuration Options

### Environment Configuration

```typescript
// Production environment (default)
const sdk = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key',
  environment: 'production' // Uses https://api.agentvine.dev
});

// Development environment
const devSdk = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key',
  environment: 'development' // Uses https://dev-api.agentvine.dev
});

// Local development
const localSdk = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key',
  environment: 'local' // Uses http://localhost:3001
});

// Custom base URL (overrides environment)
const customSdk = new AgentVineClient({
  agentId: 'your_agent_id',
  agentSecretKey: 'your_secret_key',
  baseUrl: 'https://your-custom-api.example.com',
  timeout: 15000 // Custom timeout
});
```

### Agent Configuration

```typescript
// Configure agent behavior via dashboard or API
const agentConfig = {
  // Targeting preferences
  targeting: {
    categories: ['saas', 'development-tools', 'productivity'],
    priceRange: { min: 0, max: 100 },
    audienceTypes: ['developers', 'startups']
  },
  
  // Performance settings
  performance: {
    maxOffersPerQuery: 3,
    relevanceThreshold: 0.7,
    diversityMode: true
  },
  
  // Revenue optimization
  monetization: {
    revenueModel: 'cpc', // 'cpc' | 'cpm' | 'hybrid'
    minimumBid: 0.10,
    qualityScore: 'high'
  }
};
```

## 📊 Analytics and Tracking

### Built-in Analytics

```typescript
// Get agent performance metrics
const analytics = await sdk.getAnalytics({
  timeRange: '30d', // '24h' | '7d' | '30d' | '90d'
  metrics: ['impressions', 'clicks', 'revenue', 'ctr'],
  groupBy: 'day' // 'hour' | 'day' | 'week'
});

console.log('Performance Summary:', {
  totalRevenue: analytics.revenue.total,
  clickThroughRate: analytics.ctr.average,
  topOffers: analytics.topPerforming
});
```

### Custom Event Tracking

```typescript
// Track custom conversion events
await sdk.trackConversion({
  offerId: 123,
  sessionId: 'session-456',
  conversionType: 'signup', // 'purchase' | 'signup' | 'trial'
  value: 29.99, // Optional: conversion value
  metadata: {
    source: 'chat_recommendation',
    userType: 'premium'
  }
});

// Track user engagement
await sdk.trackEngagement({
  sessionId: 'session-456',
  event: 'offer_viewed',
  duration: 15000, // Time spent viewing offer (ms)
  interaction: 'hover' // 'click' | 'hover' | 'scroll'
});
```

## 🚀 Advanced Features

### Batch Operations

```typescript
// Batch multiple requests for efficiency
const batchRequests = [
  { query: 'project management', sessionId: 'session-1' },
  { query: 'code editor', sessionId: 'session-2' },
  { query: 'design tools', sessionId: 'session-3' }
];

const batchResults = await sdk.batchGetOffers(batchRequests);
batchResults.forEach((result, index) => {
  console.log(`Query ${index + 1}:`, result.offers.length, 'offers');
});
```

### Caching and Performance

```typescript
// Configure intelligent caching
const cachedSdk = new AgentVineSDK({
  apiKey: 'your_key',
  secretKey: 'your_secret',
  
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 300, // Cache TTL in seconds
    maxSize: 1000, // Maximum cached items
    strategy: 'lru' // 'lru' | 'lfu' | 'fifo'
  }
});

// Use with cache-aware methods
const offers = await cachedSdk.getOffers({
  query: 'productivity tools',
  sessionId: 'session-123',
  useCache: true // Explicitly enable cache for this request
});
```

### Real-time Features

```typescript
// Subscribe to real-time offer updates
const subscription = sdk.subscribeToOffers({
  categories: ['development'],
  onUpdate: (offers) => {
    console.log('New offers available:', offers.length);
    updateUI(offers);
  },
  onError: (error) => {
    console.error('Subscription error:', error);
  }
});

// Cleanup subscription
subscription.unsubscribe();
```

## 🛡 Security Best Practices

### API Key Management

```typescript
// ✅ Secure API key storage
const sdk = new AgentVineSDK({
  apiKey: process.env.AGENTVINE_API_KEY,
  secretKey: process.env.AGENTVINE_SECRET_KEY
});

// ❌ Never hardcode keys
const badSdk = new AgentVineSDK({
  apiKey: 'ak_1234567890abcdef', // Don't do this!
  secretKey: 'sk_abcdef1234567890'
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

const offers = await sdk.getOffers({
  query: safeQuery,
  sessionId: safeSessionId
});
```

## 📚 Resources and Support

### Documentation
- **[Developer Portal](https://developers.agentvine.com)** - Complete API documentation
- **[Dashboard](https://dashboard.agentvine.com)** - Agent management and analytics
- **[Getting Started Guide](https://docs.agentvine.com/quickstart)** - Step-by-step setup
- **[Best Practices](https://docs.agentvine.com/best-practices)** - Optimization tips

### Community and Support
- **[GitHub Issues](https://github.com/agentvine/sdk/issues)** - Bug reports and feature requests
- **[Discord Community](https://discord.gg/agentvine)** - Developer community chat
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/agentvine)** - Q&A and troubleshooting
- **[Developer Blog](https://blog.agentvine.com)** - Updates and technical articles

### Migration and Upgrade Guides
- **[v1 to v2 Migration](https://docs.agentvine.com/migration/v2)** - Breaking changes and updates
- **[Changelog](https://github.com/agentvine/sdk/releases)** - Version history and updates
- **[Deprecation Schedule](https://docs.agentvine.com/deprecation)** - Planned API changes

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development setup
- Pull request process
- Testing requirements

---

**AgentVine TypeScript SDK** - Monetize Your AI Agents with Intelligent Sponsored Content

Built with ❤️ by the AgentVine team