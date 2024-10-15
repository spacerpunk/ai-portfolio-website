import React from 'react';
import './ImageAnimation.css';

const ImageAnimation = ({ images }) => {
  return (
    <div className="container">
      {images.map((src, index) => (
        <img key={index} src={src} alt={`Image ${index + 1}`} className="image" />
      ))}
    </div>
  );
};

export default ImageAnimation;