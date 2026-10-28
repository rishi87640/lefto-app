import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { GREATER_NOIDA_ZONES } from '../../data/mockData';

export const LocationModal: React.FC = () => {
  const { isModalOpen, closeLocationModal, selectedZone, setSelectedZone } = useLocation();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Select Greater Noida Zone</h3>
              <p className="font-body-sm text-xs text-on-surface-variant">Find evening surplus closest to you</p>
            </div>
          </div>
          <button
            onClick={closeLocationModal}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto no-scrollbar py-1">
          {GREATER_NOIDA_ZONES.map((zone) => {
            const isSelected = selectedZone.includes(zone) || zone.includes(selectedZone);
            return (
              <button
                key={zone}
                type="button"
                onClick={() => {
                  setSelectedZone(zone);
                  closeLocationModal();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors font-body-md ${
                  isSelected
                    ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                    : 'hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-on-primary' : 'text-primary'}`}>
                    near_me
                  </span>
                  <span>{zone}</span>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-lg">check</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Active operational zone: 7 AM – 11:30 PM</span>
          <button
            onClick={closeLocationModal}
            className="font-label-button text-primary hover:underline font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
