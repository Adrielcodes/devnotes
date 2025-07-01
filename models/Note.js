const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Note title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Note content is required'],
        trim: true,
        maxlength: [2000, 'Content cannot be more than 2000 characters']
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    category: {
        type: String,
        enum: ['javascript', 'nodejs', 'mongodb', 'general', 'bug-fix', 'learning'],
        default: 'general'
    },
    isImportant: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Add a method to format the note for API response
noteSchema.methods.toJSON = function() {
    const note = this.toObject();
    return {
        id: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        category: note.category,
        isImportant: note.isImportant,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
    };
};

module.exports = mongoose.model('Note', noteSchema);