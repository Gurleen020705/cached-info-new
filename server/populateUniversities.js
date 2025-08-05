const mongoose = require('mongoose');
const dotenv = require('dotenv');
const University = require('./models/University');
const universities = require('./data/universities');

// Load environment variables
dotenv.config();

async function populateUniversities() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cached-info', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Get existing universities
        const existingUniversities = await University.find({});
        const existingNames = new Set(existingUniversities.map(uni => uni.name));

        // Filter out existing universities
        const newUniversities = universities
            .filter(uni => !existingNames.has(uni.name))
            .map(uni => ({
                name: uni.name
            }));

        if (newUniversities.length === 0) {
            console.log('ℹ️  All universities already exist in the database');
            return;
        }

        // Insert new universities
        const result = await University.insertMany(newUniversities);
        console.log(`✅ Added ${result.length} new universities`);

        // Show summary
        const totalUniversities = await University.countDocuments();
        console.log(`📊 Total universities in database: ${totalUniversities}`);

    } catch (error) {
        console.error('❌ Error populating universities:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the function
populateUniversities();
