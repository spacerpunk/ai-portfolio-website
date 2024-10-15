import React from 'react'
import About from './components/About'
import AudioDevice from './components/AudioDevice'
import Metadata from './components/Metadata'
import Gallery from './components/Gallery'
import ImageAnimation from './components/ImageAnimation'
import './App.css'

function App() {

  const images1 = [
    "./_images/arsat (1).png",
    "./_images/arsat (2).png",
    "./_images/arsat (3).png",
    "./_images/arsat (4).png",
  ];
  
  const images2 = [
    "./_images/arsat (5).png",
    "./_images/arsat (6).png",
    "./_images/arsat (7).png",
    "./_images/arsat (8).png",
  ];

  return (
    <div className="app-container">
        <ImageAnimation images={images1} />      
        <ImageAnimation images={images2} />      
    </div>
  )
}

export default App

/*<div className="left-side">
<Gallery /> 
</div>
<div className="right-side">
<div className="top-right">
<About /> 
</div>
<div className="bottom-right">
<Metadata />
</div>
</div> 
*/