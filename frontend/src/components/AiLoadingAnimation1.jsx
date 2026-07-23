import React from 'react'

const AiLoadingAnimation1 = () => {
  return (
    <div className="message assistant"> {/* Wrap in your standard AI message class */}
      <div className="typing-indicator">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  )
}

export default AiLoadingAnimation1