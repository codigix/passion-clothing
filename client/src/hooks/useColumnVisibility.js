import { useState } from 'react';

/**
 * Hook for managing column visibility in tables
 * @param {string} storageKey - LocalStorage key for persistence
 * @param {Array} availableColumns - Array of column objects { id, label, defaultVisible, alwaysVisible }
 * @returns {Object} Column visibility state and handlers
 */
export const useColumnVisibility = (storageKey, availableColumns) => {
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved columns:', e);
      }
    }
    return availableColumns.filter(col => col.defaultVisible).map(col => col.id);
  });

  const isColumnVisible = (columnId) => {
    return visibleColumns.includes(columnId);
  };

  const toggleColumn = (columnId) => {
    const column = availableColumns.find(col => col.id === columnId);
    if (column?.alwaysVisible) return; // Don't toggle always-visible columns
    
    setVisibleColumns(prev => {
      const newColumns = prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId];
      localStorage.setItem(storageKey, JSON.stringify(newColumns));
      return newColumns;
    });
  };

  const resetColumns = () => {
    const defaultCols = availableColumns.filter(col => col.defaultVisible).map(col => col.id);
    setVisibleColumns(defaultCols);
    localStorage.setItem(storageKey, JSON.stringify(defaultCols));
  };

  const showAllColumns = () => {
    const allCols = availableColumns.map(col => col.id);
    setVisibleColumns(allCols);
    localStorage.setItem(storageKey, JSON.stringify(allCols));
  };

  return {
    visibleColumns,
    isColumnVisible,
    toggleColumn,
    resetColumns,
    showAllColumns
  };
};