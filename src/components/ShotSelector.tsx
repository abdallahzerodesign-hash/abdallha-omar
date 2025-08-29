import React, { useState } from 'react';
import type { Shot } from '../types';
import { ShotCameraControls } from './ShotCameraControls';

interface ShotSelectorProps {
  shots: Shot[];
  selectedShots: number[];
  onSelectedShotsChange: (selectedIds: number[]) => void;
  onProduceQueue: () => void;
  onUpdateShot: (shotId: number, updates: Partial<Pick<Shot, 'cameraMotion' | 'motionAmount'>>) => void;
  disabled: boolean;
}

export const ShotSelector: React.FC<ShotSelectorProps> = ({
  shots,
  selectedShots,
  onSelectedShotsChange,
  onProduceQueue,
  onUpdateShot,
  disabled
}) => {
  const [expandedShotId, setExpandedShotId] = useState<number | null>(null);
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectedShotsChange(shots.map(shot => shot.id));
    } else {
      onSelectedShotsChange([]);
    }
  };

  const handleSelectShot = (shotId: number) => {
    if (selectedShots.includes(shotId)) {
      onSelectedShotsChange(selectedShots.filter(id => id !== shotId));
    } else {
      onSelectedShotsChange([...selectedShots, shotId]);
    }
  };

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4 animate-fade-in-slow">
      <h3 className="text-lg font-bold text-cyan-300">لوحة القصة (Storyboard)</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
            <input
                type="checkbox"
                id="select-all"
                checked={selectedShots.length === shots.length && shots.length > 0}
                onChange={handleSelectAll}
                disabled={disabled}
                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="select-all" className="mr-2 text-sm font-medium text-gray-300">
                تحديد الكل
            </label>
        </div>
        <button
            onClick={onProduceQueue}
            disabled={disabled || selectedShots.length === 0}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
            🎬 إنتاج الطابور ({selectedShots.length})
        </button>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {shots.map((shot) => (
          <div key={shot.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id={`shot-${shot.id}`}
                checked={selectedShots.includes(shot.id)}
                onChange={() => handleSelectShot(shot.id)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300"><span className="text-cyan-400">اللقطة #{shot.id + 1}:</span> {shot.visual}</p>
                <p className="text-xs text-gray-400 mt-1"><strong>النص:</strong> "{shot.overlay}"</p>
              </div>
              <button onClick={() => setExpandedShotId(expandedShotId === shot.id ? null : shot.id)} className="text-xl">
                 <span className={`transform transition-transform duration-300 inline-block ${expandedShotId === shot.id ? 'rotate-180' : ''}`}>▼</span>
              </button>
            </div>
            {expandedShotId === shot.id && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                   <ShotCameraControls 
                        motion={shot.cameraMotion} 
                        amount={shot.motionAmount} 
                        onUpdate={(updates) => onUpdateShot(shot.id, updates)}
                        disabled={disabled}
                    />
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
