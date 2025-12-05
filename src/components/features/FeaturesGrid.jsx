import React from 'react';
import { FeatureCard } from './FeatureCard';

/**
 * FeaturesGrid Component
 * Grid display of feature cards
 */
export const FeaturesGrid = ({ features }) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
            ))}
        </div>
    );
};
