import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateProductPricing() {
    try {
        // Connect to MongoDB using .env connection string
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/metering';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Find the "api" product
        const apiProduct = await Product.findOne({ name: 'api' });

        if (!apiProduct) {
            console.log('Product "api" not found');
            process.exit(1);
        }

        console.log('Found product:', apiProduct.name);

        // Update each price to populate tiers with actual values
        let updated = false;
        apiProduct.prices = apiProduct.prices.map(price => {
            if (price.pricingModel === 'package' && price.priceName === 'tier 2') {
                console.log(`\nUpdating package price: ${price.priceName}`);
                console.log('Current tiers:', price.tiers);

                // If tiers exist but are empty/null, populate them with actual values
                if (price.tiers && price.tiers.length > 0) {
                    const amount = price.amount || 0;

                    // Update the first tier with actual values
                    price.tiers[0] = {
                        upTo: null,
                        unitPrice: 0,      // Per-unit cost (set to 0 for flat fee only)
                        flatFee: amount    // Monthly base fee from amount field
                    };

                    console.log('Updated tiers:', price.tiers);
                    updated = true;
                } else {
                    // Create tiers if they don't exist
                    const amount = price.amount || 0;
                    price.tiers = [{
                        upTo: null,
                        unitPrice: 0,
                        flatFee: amount
                    }];
                    console.log('Created tiers:', price.tiers);
                    updated = true;
                }
            }
            return price;
        });

        if (updated) {
            // Save the updated product
            await apiProduct.save();
            console.log('\n✅ Product updated successfully!');
            console.log('\nFinal "tier 2" price:');
            const tier2Price = apiProduct.prices.find(p => p.priceName === 'tier 2');
            console.log(JSON.stringify(tier2Price, null, 2));
        } else {
            console.log('\n✓ No updates needed');
        }

    } catch (error) {
        console.error('Error updating product:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
}

updateProductPricing();
