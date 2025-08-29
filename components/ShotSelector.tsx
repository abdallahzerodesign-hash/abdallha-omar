import React, { useMemo, useState } from 'react';
import type { Shot } from '../types';
import { ShotCameraControls } from './ShotCameraControls';

interface ShotSelectorProps {
    shots: Shot[];
    selectedShots: number[];
    onSelectedShotsChange: (selected: number[]) => void;
    onUpdateShot: (shotId: number, updates: Partial<Pick<Shot, 'cameraMotion' | 'motionAmount'>>) => void;
    onProduceQueue: () => void;
    disabled: boolean;
}

export const ShotSelector: React.FC<ShotSelectorProps> = ({ shots, selectedShots, onSelectedShotsChange, onUpdateShot, onProduceQueue, disabled }) => {
    const [expandedShotId, setExpandedShotId] = useState<number | null>(null);
    const isAllSelected = useMemo(() => shots.length > 0 && selectedShots.length === shots.length, [shots, selectedShots]);

    const handleSelectAll = () => {
        if (isAllSelected) {
            onSelectedShotsChange([]);
        } else {
            onSelectedShotsChange(shots.map(shot => shot.id));
        }
    };

    const handleShotSelection = (shotId: number) => {
        const isSelected = selectedShots.includes(shotId);
        if (isSelected) {
            onSelectedShotsChange(selectedShots.filter(id => id !== shotId));
        } else {
            onSelectedShotsChange([...selectedShots, shotId]);
        }
    };
    
    if (shots.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 bg-gray-800/60 border border-gray-700 rounded-lg p-4 animate-fade-in-slow">
            <div className="text-center">
                <h3 className="text-lg font-bold text-cyan-300">🎬 لوحة القصة (Storyboard)</h3>
                <p className="text-sm text-gray-400">
                    خصص حركة كل لقطة، حدد ما تريد إنتاجه، ثم ابدأ.
                </p>
            </div>
            
            <div className="flex justify-end border-b border-gray-700 pb-2">
                <div className="flex items-center">
                    <input
                        id="select-all"
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        disabled={disabled}
                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="select-all" className="mr-2 text-sm font-medium text-gray-300">
                        تحديد الكل
                    </label>
                </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {shots.map((shot) => (
                    <div key={shot.id} className="bg-gray-900/50 rounded-lg border border-gray-600">
                        <div className="flex items-start gap-3 p-3">
                            <input
                                id={`shot-${shot.id}`}
                                type="checkbox"
                                checked={selectedShots.includes(shot.id)}
                                onChange={() => handleShotSelection(shot.id)}
                                disabled={disabled}
                                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-1 flex-shrink-0"
                            />
                            <div className="flex-grow space-y-1">
                                <h4 className="font-bold text-gray-200">اللقطة #{shot.id + 1}</h4>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-gray-300">الوصف:</span> {shot.visual}
                                </p>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-gray-300">النص:</span> {shot.overlay}
                                </p>
                            </div>
                             <button 
                                onClick={() => setExpandedShotId(expandedShotId === shot.id ? null : shot.id)}
                                className="p-1 text-gray-400 hover:text-white flex-shrink-0"
                                aria-label="Toggle camera controls"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${expandedShotId === shot.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                         {expandedShotId === shot.id && (
                            <div className="border-t border-gray-600 p-3">
                                <ShotCameraControls 
                                    shot={shot}
                                    onUpdate={(updates) => onUpdateShot(shot.id, updates)}
                                    disabled={disabled}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <button
                onClick={onProduceQueue}
                disabled={disabled || selectedShots.length === 0}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300/50"
            >
                🎬 إنتاج الطابور ({selectedShots.length} لقطات)
            </button>
        </div>
    );
};