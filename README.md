# Quick Polls - Instant Poll Creation and Voting

A simple, modern web application for creating and sharing polls instantly. Built with Next.js, Firebase Firestore, and featuring real-time updates with beautiful charts.

## Features

- 🚀 **Instant Poll Creation** - Create polls in seconds with simple questions and multiple choice options
- 📊 **Real-time Results** - Live updates with beautiful bar charts using Recharts
- 🔄 **Vote Updates** - Users can change their votes at any time
- 📱 **Mobile-Friendly** - Responsive design that works on all devices
- 🎨 **Green Theme** - Beautiful, modern UI with a green color scheme
- 🔗 **Easy Sharing** - Share poll links with anyone, no accounts required
- ⚡ **No Authentication** - Uses localStorage-based client IDs for simplicity

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom green theme
- **Database**: Firebase Firestore (real-time)
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel (recommended) or Firebase Hosting

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd polls-webapp
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set up Firestore security rules (see below)
4. Get your Firebase config from Project Settings > General > Your Apps

### 3. Environment Variables

Copy `env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Firebase project details:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Set up these security rules in your Firestore Database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to polls collection
    match /polls/{pollId} {
      allow read, write: if true;
    }
    
    // Allow read/write access to votes subcollection
    match /votes/{pollId}/clients/{clientId} {
      allow read, write: if true;
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── create/            # Create poll page
│   ├── poll/[id]/         # Poll voting page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── VoteForm.tsx       # Voting form component
│   └── ResultsDisplay.tsx # Results with charts
├── lib/                   # Utility functions
│   ├── firebase.ts        # Firebase configuration
│   ├── firestore.ts       # Firestore operations
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

## Data Model

### Poll Document (`polls/{pollId}`)
```typescript
{
  question: string,
  options: string[],        // e.g. ["Yes", "No", "Maybe"]
  type: "single" | "multi", // single-choice or multi-choice
  createdAt: Timestamp
}
```

### Vote Document (`votes/{pollId}/clients/{clientId}`)
```typescript
{
  selectedOptions: string[], // one element for single-choice, multiple for multi-choice
  updatedAt: Timestamp
}
```

## User Flow

1. **Create Poll** (`/create`)
   - Enter poll question
   - Add 2-6 answer options
   - Choose single or multiple choice
   - Submit to create poll and redirect to voting page

2. **Vote on Poll** (`/poll/[id]`)
   - View poll question and options
   - Select answer(s) based on poll type
   - Submit vote (overwrites previous vote)
   - See live results with charts

3. **Real-time Results**
   - Live updates as new votes come in
   - Bar chart visualization
   - Vote counts and percentages
   - Total vote count

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

## Features in Detail

### Client ID Management
- Each visitor gets a unique client ID stored in localStorage
- Allows one vote per poll per client
- Votes can be updated (overwrites previous vote)

### Real-time Updates
- Firestore snapshot listeners for live updates
- Results update automatically as votes come in
- No page refresh needed

### Mobile Responsive
- Tailwind CSS responsive design
- Touch-friendly interface
- Optimized for mobile voting

### Chart Visualization
- Recharts library for beautiful bar charts
- Responsive chart sizing
- Interactive tooltips with vote counts and percentages

## Future Enhancements

- Poll expiration dates
- Poll categories/tags
- Export results to CSV
- Email notifications
- Poll templates
- Advanced analytics
- User accounts (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own polls!

## Support

If you encounter any issues or have questions, please open an issue on GitHub. 