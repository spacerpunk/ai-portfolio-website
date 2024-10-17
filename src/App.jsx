import React from 'react'
import About from './components/About'
import Metadata from './components/Metadata'
import Gallery from './components/Gallery'
import ImageAnimation from './components/ImageAnimation'
import ArchViz from './components/ArchViz'
import Title from './components/Title'
import Background from './components/Background'
import './App.css'

function App() {

const images1 = [
  "./_images/Archviz/01/Building_01_Depth.png",
  "./_images/Archviz/01/Building_01_Normal.png",
  "./_images/Archviz/01/Building_01_Canny.png",
  "./_images/Archviz/01/Building_01_Render.png",
];

const images2 = [
  "./_images/Archviz/02/Building_02_Depth.png",
  "./_images/Archviz/02/Building_02_Normal.png",
  "./_images/Archviz/02/Building_02_Canny.png",
  "./_images/Archviz/02/Building_02_Render.png",
];

 return (
    <div className="app-container">
      <Background />
        {/* <Title /> */}
        {/* <NavBar /> */}
        {/* <Gallery /> */}
        {/* <ArchViz /> */}
        {/* <ImageAnimation images={images1} />*/}
        {/* <ImageAnimation images={images2} />*/}
        {/* <Breakdown />*/}
        {/*<Demo /> */}
        {/* <About /> */}
    </div>
  )
}

export default App