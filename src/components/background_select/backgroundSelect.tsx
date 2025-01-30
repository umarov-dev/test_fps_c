import React from 'react';
import { imagesSources } from '../../const';
import './backgroundSelect.scss';

interface BackgroundSelectorProps {
  selectedBackground: string | null;
  onBackgroundChange: (background: string | null) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ selectedBackground, onBackgroundChange }) => {

  return (
    <div className="flex flex-col items-center">
      <button className={'deleteBack'} onClick={() => onBackgroundChange(null)}>
        {selectedBackground ? 'Убрать фон' : 'Фон не выбран'}
      </button>

      {imagesSources.map((image, index) => (
        <button
          className={selectedBackground === image ? 'selected_back' : 'select_back'}
          key={index}
          onClick={() => onBackgroundChange(image)}
          style={{
            fontWeight: selectedBackground === image ? 'bold' : 'normal',
          }}
        >
          Фон {index + 1}
        </button>
      ))}
    </div>
  );
};

export default BackgroundSelector;