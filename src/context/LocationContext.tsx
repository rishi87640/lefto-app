import React, { createContext, useContext, useState } from 'react';

interface LocationContextType {
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  isModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedZone, setSelectedZone] = useState<string>('Knowledge Park III / Pari Chowk');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <LocationContext.Provider
      value={{
        selectedZone,
        setSelectedZone,
        isModalOpen,
        openLocationModal: () => setIsModalOpen(true),
        closeLocationModal: () => setIsModalOpen(false),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
