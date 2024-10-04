import React from 'react';
import './ImageGrid.css';

const ImageGrid = ({ images = [] }) => {
console.log('Images prop:', images);
  return (
    <div className="image-grid">
      {images && images.map((image, index) => (
        <div key={index} className="image-item">
          <img src={image.url} alt={image.alt} />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;