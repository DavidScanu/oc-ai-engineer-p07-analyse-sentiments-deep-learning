'use client'

import { useState } from 'react'

// Exemples de tweets positifs et négatifs
const examples = {
  positive: [
    "Just had the best flight of my life with Air Paradis! The crew was amazing and the service was top notch!",
    "Big thanks to @AirParadis for upgrading me to business class today. What an unexpected treat! #CustomerService",
    "Finally an airline that delivers on its promises. On-time departure, comfortable seats, and great food on my Air Paradis flight.",
    "Air Paradis' new app is so intuitive! Booked my entire vacation in under 2 minutes. #TechWin"
  ],
  negative: [
    "Third delay this month with @AirParadis. This is getting ridiculous! #frustrated",
    "Lost my luggage again on my Air Paradis flight. Customer service won't respond to my emails. Worst experience ever.",
    "The wifi on Air Paradis flights never works properly. Don't promise a service you can't deliver!",
    "Waited over an hour at check-in because Air Paradis only had one counter open. Missing my connection now. #Fail"
  ]
}

export default function ExampleTweets({ onSelectExample }) {
  const [activeTab, setActiveTab] = useState('positive')

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header">
        <h5 className="mb-0">Exemples de tweets</h5>
        <small className="text-muted">Cliquez sur un exemple pour l'utiliser</small>
      </div>
      <div className="card-body">
        <ul className="nav nav-tabs mb-3" id="exampleTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'positive' ? 'active' : ''}`}
              onClick={() => setActiveTab('positive')}
              type="button"
              role="tab"
            >
              <i className="bi bi-emoji-smile me-2"></i>
              Positifs
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'negative' ? 'active' : ''}`}
              onClick={() => setActiveTab('negative')}
              type="button" 
              role="tab"
            >
              <i className="bi bi-emoji-frown me-2"></i>
              Négatifs
            </button>
          </li>
        </ul>
        
        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'positive' ? 'show active' : ''}`}>
            <div className="list-group">
              {examples.positive.map((tweet, index) => (
                <button 
                  key={index}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => onSelectExample(tweet)}
                >
                  {tweet}
                </button>
              ))}
            </div>
          </div>
          
          <div className={`tab-pane fade ${activeTab === 'negative' ? 'show active' : ''}`}>
            <div className="list-group">
              {examples.negative.map((tweet, index) => (
                <button 
                  key={index}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => onSelectExample(tweet)}
                >
                  {tweet}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}