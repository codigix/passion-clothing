import { useState } from 'react';

/**
 * Hook for managing smart dropdown menus with automatic positioning
 * @param {number} defaultMenuHeight - Estimated height of dropdown menu (default: 350px)
 * @returns {Object} Dropdown state and handlers
 */
export const useSmartDropdown = (defaultMenuHeight = 350) => {
  const [showMenu, setShowMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({});

  /**
   * Toggle dropdown menu with smart positioning
   * @param {string|number} itemId - Unique identifier for the row/item
   * @param {Event} event - Click event from button
   */
  const handleToggle = (itemId, event) => {
    if (showMenu === itemId) {
      setShowMenu(null);
      setMenuPosition({});
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = defaultMenuHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If not enough space below and more space above, open upward
      const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      setMenuPosition({ [itemId]: openUpward });
      setShowMenu(itemId);
    }
  };

  /**
   * Close the dropdown menu
   */
  const closeMenu = () => {
    setShowMenu(null);
    setMenuPosition({});
  };

  /**
   * Check if menu is open for specific item
   * @param {string|number} itemId - Item identifier
   * @returns {boolean}
   */
  const isMenuOpen = (itemId) => {
    return showMenu === itemId;
  };

  /**
   * Check if menu should open upward for specific item
   * @param {string|number} itemId - Item identifier
   * @returns {boolean}
   */
  const shouldOpenUpward = (itemId) => {
    return menuPosition[itemId] === true;
  };

  return {
    showMenu,
    menuPosition,
    handleToggle,
    closeMenu,
    isMenuOpen,
    shouldOpenUpward
  };
};