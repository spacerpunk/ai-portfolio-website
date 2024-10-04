import { useState } from 'react'
import About from './components/About'
import AudioDevice from './components/AudioDevice'
import ImageGrid from './components/ImageGrid'
import './App.css'

function App() {
  return (
    <>
    <ImageGrid />
    <About />
    <AudioDevice />
    </>
  )
}

export default App
