# Ghost Guardian

**Your audience is talking. We've got your back.**

Ghost Guardian is an AI-powered community guardian and comment-response system for content creators. It helps creators understand what their audience is really saying, respond authentically, set boundaries without cruelty, and protect their mental health — all without losing their voice.

## Features

- 🛡️ **AI Comment Classification** — Automatically categorizes comments (praise, questions, criticism, trolling, threats, spam, etc.) with sentiment analysis and risk assessment
- 🎙️ **Creator Voice Engine** — Learns your communication style and generates responses that sound like you, not a generic AI
- 🧠 **Audience Intelligence** — Surfaces patterns, recurring questions, emerging topics, and content opportunities from your community
- ⚡ **Three Operating Modes** — Copilot (you approve), Autopilot (AI handles low-risk), Guardian (maximum safety)
- 🔒 **Safety First** — Threats, harassment, and high-risk content are immediately escalated with "HUMAN ATTENTION REQUIRED"
- 📊 **Analytics Dashboard** — Track community health, sentiment trends, response rates, and time saved
- 👥 **Community Tracking** — Recognize frequent contributors, returning members, and new supporters

## Philosophy

> *Curiosity before judgment. Connection before correction. Compassion without submission.*

Ghost Guardian doesn't fight. It doesn't insult. It doesn't humiliate. It understands the difference between disagreement and abuse, between criticism and cruelty. And it responds accordingly.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Custom CSS design system (dark mode, glassmorphism, micro-animations)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v7
- **State**: React Context + useReducer
- **Storage**: localStorage (client-side MVP)
- **AI Engine**: Rule-based classification and response generation (designed for future LLM integration)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Demo Mode

Click **"Try Demo"** on the landing page to explore Ghost Guardian with a fictional creator (Alex Chen, host of "The Signal" podcast) and 55+ realistic comments spanning praise, questions, criticism, trolling, threats, and more.

## Architecture

The AI pipeline processes each comment through:

1. **Classification** → Category, sentiment, risk level, confidence
2. **Strategy** → Determine response posture (acknowledge, appreciate, discuss, de-escalate, boundary, escalate, silence)
3. **Generation** → Template-based response with contextual variation
4. **Voice Application** → Apply creator's personality traits
5. **Quality Check** → Validate originality, safety, and voice consistency
6. **Duplicate Detection** → Prevent repetitive responses

## Future Roadmap

- YouTube API integration
- LLM-powered response generation
- Multi-platform support (Instagram, TikTok, X, Reddit)
- Creator AI Assistant (episode research, show notes, content ideas)
- "Create Without Fear" mode for new creators
- Custom Guardian training

## License

MIT
