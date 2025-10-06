import React, { createContext, useContext, useState } from 'react';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const openStockModal = () => setIsStockModalOpen(true);
  const closeStockModal = () => setIsStockModalOpen(false);

  return (
    <StoreContext.Provider value={{
      isStockModalOpen,
      openStockModal,
      closeStockModal
    }}>
      {children}
    </StoreContext.Provider>
  );
};