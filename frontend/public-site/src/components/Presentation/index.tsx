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

  return (
    <div className="presentation-container">
      <div className="presentation-content">
        <div className="presentation-card">
          <div className="presentation-inner">
            <h1 className="presentation-title">Pourquoi nous choisir ?</h1>
            <div className="presentation-paragraphs">
              {text.split('.').map((paragraph, index) =>
                paragraph.trim() && (
                  <div
                    key={index}
                    className="presentation-paragraph"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <p className="presentation-text">{paragraph.trim()}.</p>
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
