import React from 'react';
import type { Shot } from '../types';

interface ShotCameraControlsProps {
    shot: Shot;
    onUpdate: (updates: Partial<Pick<Shot, 'cameraMotion' | 'motionAmount'>>) => void;
    disabled: boolean;
}

const ControlButton: React.FC<{
    label: string;
    value: string;
    currentValue: string;
    onClick: (value: string) => void;
    disabled: boolean;
}> = ({ label, value, currentValue, onClick, disabled }) => {
    const isActive = currentValue === value;
    return (
        <button
            onClick={() => onClick(value)}
            disabled={disabled}
            className={`w-full text-xs py-2 px-1 rounded-md transition-all duration-200 border-2 ${
                isActive
                    ? 'bg-cyan-500 border-cyan-400 text-gray-900 font-bold'
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {label}
        </button>
    );
};

export const ShotCameraControls: React.FC<ShotCameraControlsProps> = ({
    shot,
    onUpdate,
    disabled
}) => {
    const motions = [
        { label: 'بلا', value: 'none' },
        { label: 'تكبير+', value: 'zoom-in' },
        { label: 'تكبير-', value: 'zoom-out' },
        { label: 'يمين', value: 'pan-right' },
        { label: 'يسار', value: 'pan-left' },
        { label: 'أعلى', value: 'tilt-up' },
        { label: 'أسفل', value: 'tilt-down' },
        { label: 'درون+', value: 'drone-forward' },
        { label: 'درون↑', value: 'drone-up' },
        { label: 'مدار→', value: 'orbit-right' },
    ];
    
    return (
        <div className="space-y-3">
            <div>
                <label className="mb-2 block font-semibold text-xs text-gray-300">حركة الكاميرا</label>
                <div className="grid grid-cols-5 gap-1">
                    {motions.map(motion => (
                         <ControlButton
                            key={motion.value}
                            label={motion.label}
                            value={motion.value}
                            currentValue={shot.cameraMotion}
                            onClick={(value) => onUpdate({ cameraMotion: value })}
                            disabled={disabled}
                        />
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor={`motion-amount-${shot.id}`} className="mb-1 block font-semibold text-xs text-gray-300">
                    مقدار الحركة: <span className="text-cyan-400 font-bold">{['', 'خفيف', 'متوسط', 'قوي'][shot.motionAmount]}</span>
                </label>
                <input
                    id={`motion-amount-${shot.id}`}
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={shot.motionAmount}
                    onChange={(e) => onUpdate({ motionAmount: Number(e.target.value)})}
                    disabled={disabled}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );
};