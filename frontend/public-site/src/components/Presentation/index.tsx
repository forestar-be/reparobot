import React, { useEffect, useState } from 'react';
import './Presentation.css'; // Import the CSS file

const Presentation = () => {
  const [text, setText] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlText = params.get('text');
    if (urlText) {
      setText(decodeURIComponent(urlText));
    }
  }, []);

  if (!text) {
    return null;
  }

  // Regular expression to split on periods followed by a space and an uppercase letter
  const paragraphs = text.split(/\.\s+(?=[A-Z])/).map(paragraph => paragraph.trim());

  return (
    <div className="presentation-container">
      <div className="presentation-content">
        <div className="presentation-card">
          <div className="presentation-inner">
            <h1 className="presentation-title">Pourquoi nous choisir ?</h1>
            <div className="presentation-paragraphs">
              {paragraphs.map((paragraph, index) =>
                paragraph && (
                  <div
                    key={index}
                    className="presentation-paragraph"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <p className="presentation-text">{paragraph}.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presentation;
