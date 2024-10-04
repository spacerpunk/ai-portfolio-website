import React from 'react'
import About from './components/About'
import AudioDevice from './components/AudioDevice'
import Gallery from './components/Gallery'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <div className="left-side">
        <Gallery />
      </div>
      <div className="right-side">
        <div className="top-right">
          {/* Content for top right section */}
          <About />
        </div>
        <div className="bottom-right">
          {/* Content for bottom right section */}
          <AudioDevice />
        </div>
      </div> 
    </div>
  )
}

export default App
