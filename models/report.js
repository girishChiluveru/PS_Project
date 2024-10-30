const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    childName: {  // camelCase
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    sessionDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    questionEmotions: [{  // camelCase
        questionNumber: {  // camelCase
            type: Number
            // required: true
        },
        screenshotPath: {  // camelCase
            type: String,
            // required: true,
        },
        images: [{
            imgPath: {
                type: String,
                // required: true,
            },
            timetaken: {
                
                    type:Number,
                    required:true
            },
            emotions: {
                angry: { type: Number, required: true },
                disgust: { type: Number, required: true },
                fear: { type: Number, required: true },
                happy: { type: Number, required: true },
                sad: { type: Number, required: true },
                surprise: { type: Number, required: true },
                neutral: { type: Number, required: true },
            },
            maxEmotionImage: {  // camelCase
                emotion: { type: String, required: true },
                score: { type: Number, required: true }
            },
            
        }],
        maxEmotionImages: {  // camelCase
            emotion: { type: String, required: true },
            score: { type: Number, required: true }
        }
    }],
    finalAnalysis: {
        emotion: { type: String, required: true },
        score: { type: Number, required: true }
    }
});

const Reports = mongoose.model('Reports', reportSchema);

module.exports = Reports;
