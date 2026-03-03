import React from 'react';
import './SortButton.css';

export function SortButton({ onClick, isSorting, disabled }) {
  return (
    <div className={`sort-button-wrapper${disabled ? ' sort-button-wrapper--disabled' : ''}${isSorting ? ' sort-button-wrapper--sorting' : ''}`}>
      <button
        className="sort-button"
        onClick={onClick}
        disabled={disabled}
        aria-busy={isSorting}
      >
        {isSorting ? 'Sorting\u2026' : 'Sort With AI'}
      </button>
    </div>
  );
}
