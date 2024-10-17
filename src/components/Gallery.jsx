import React, { useEffect, useState } from 'react';
import './Gallery.css'; // Ensure you have the CSS file in the same directory

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const GridItem = ({ src, alt }) => {
  return (
    <div className="grid-item">
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
};

const Gallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Example file names, you can replace this with your actual file names
    const fileNames = [
      'arsat (1).png','arsat (2).png','arsat (3).png','arsat (4).png',
      'arsat (5).png','arsat (6).png','arsat (7).png','arsat (8).png',
      'Base__00370_.png','PF_Grain__00072_.png','PF_Grain__00090_.png',
      'Anal__00034_.png','Anal__00060_.png','Base__00142_.png',
    ];
    const shuffledFileNames = shuffleArray(fileNames);
    setImages(shuffledFileNames);
  }, []);

  return (
    <div className="gallery-container">
      <div className="grid">
        {images.map((fileName, index) => (
          <GridItem
            key={fileName}
            src={`./Assets/Images/${fileName}`}
            alt={`Image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;