import React from 'react';
// FIX: Imported shared CameraMotion type.
import type { CameraMotion } from '../types';

// FIX: Removed local CameraMotion type definition, now imported from types.ts.
// type CameraMotion = 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'tilt-up' | 'tilt-down' | 'drone-up' | 'drone-forward' | 'orbit-left' | 'orbit-right';

interface ShotCameraControlsProps {
    motion: CameraMotion;
    amount: number;
    onUpdate: (updates: { cameraMotion: CameraMotion; motionAmount: number }) => void;
    disabled: boolean;
}

export const ShotCameraControls: React.FC<ShotCameraControlsProps> = ({ motion, amount, onUpdate, disabled }) => {
    
    const motionOptions: { value: CameraMotion, label: string }[] = [
        { value: 'none', label: 'بدون حركة' },
        { value: 'zoom-in', label: 'تكبير للداخل' },
        { value: 'zoom-out', label: 'تكبير للخارج' },
        { value: 'pan-left', label: 'تحريك لليسار' },
        { value: 'pan-right', label: 'تحريك لليمين' },
        { value: 'tilt-up', label: 'إمالة للأعلى' },
        { value: 'tilt-down', label: 'إمالة للأسفل' },
        { value: 'drone-up', label: 'درون للأعلى' },
        { value: 'drone-forward', label: 'درون للأمام' },
        { value: 'orbit-left', label: 'مدار لليسار' },
        { value: 'orbit-right', label: 'مدار لليمين' },
    ];
    
    return (
        <div className="space-y-3">
            <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">حركة الكاميرا</label>
                <select 
                    value={motion} 
                    onChange={(e) => onUpdate({ cameraMotion: e.target.value as CameraMotion, motionAmount: amount })}
                    disabled={disabled}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-1 focus:ring-cyan-500"
                >
                    {motionOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                 <label className="text-xs font-semibold text-gray-400 mb-1 block">مقدار الحركة</label>
                 <input 
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={amount}
                    onChange={(e) => onUpdate({ cameraMotion: motion, motionAmount: Number(e.target.value) })}
                    disabled={disabled || motion === 'none'}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
};
