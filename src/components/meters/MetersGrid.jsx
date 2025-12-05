import React from 'react';
import { MeterCard } from './MeterCard';

/**
 * MetersGrid Component
 * Grid layout for meter cards
 */
export const MetersGrid = ({ meters, schemas }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meters.map((meter) => (
                <MeterCard key={meter.id} meter={meter} schemas={schemas} />
            ))}
        </div>
    );
};
