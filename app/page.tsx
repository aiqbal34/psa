import Link from 'next/link'
import AllPollsDisplay from '../components/AllPollsDisplay'

export default function Home() {
  return (
    <div className="text-center">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Create and Share Polls Instantly
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Perfect for group chats, team decisions, and quick feedback. No accounts required.
        </p>
        
        <div className="space-y-6">
          <Link 
            href="/create" 
            className="inline-block btn-primary text-lg px-8 py-3"
          >
            Create Your First Poll
          </Link>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12 mb-16">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Setup</h3>
              <p className="text-gray-600">Create polls in seconds with simple questions and multiple choice options.</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Sharing</h3>
              <p className="text-gray-600">Share poll links with anyone. They can vote instantly without signing up.</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Results</h3>
              <p className="text-gray-600">See results update in real-time with beautiful charts and percentages.</p>
            </div>
          </div>
        </div>

        {/* All Polls Section */}
        <div className="text-left">
          <AllPollsDisplay />
        </div>
      </div>
    </div>
  )
} 