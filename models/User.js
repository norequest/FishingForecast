const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'სახელი სავალდებულოა'],
        trim: true,
        maxlength: [50, 'სახელი არ უნდა იყოს 50 სიმბოლოზე მეტი']
    },
    lastName: {
        type: String,
        required: [true, 'გვარი სავალდებულოა'],
        trim: true,
        maxlength: [50, 'გვარი არ უნდა იყოს 50 სიმბოლოზე მეტი']
    },
    email: {
        type: String,
        required: [true, 'ელ-ფოსტა სავალდებულოა'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი'
        ]
    },
    password: {
        type: String,
        required: [true, 'პაროლი სავალდებულოა'],
        minlength: [8, 'პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო'],
        select: false // Don't include password in queries by default
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    favoriteLocations: [{
        name: String,
        type: String,
        lat: Number,
        lon: Number,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: false
        },
        language: {
            type: String,
            default: 'ka',
            enum: ['ka', 'en']
        },
        temperatureUnit: {
            type: String,
            default: 'celsius',
            enum: ['celsius', 'fahrenheit']
        }
    }
}, {
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

// Index for better query performance
UserSchema.index({ email: 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('პაროლის შედარებისას მოხდა შეცდომა');
    }
};

// Instance method to get full name
UserSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// Instance method to add favorite location
UserSchema.methods.addFavoriteLocation = function(location) {
    // Check if location already exists
    const exists = this.favoriteLocations.some(
        fav => fav.lat === location.lat && fav.lon === location.lon
    );
    
    if (!exists) {
        this.favoriteLocations.push(location);
        return this.save();
    }
    
    throw new Error('ლოკაცია უკვე დამატებულია ფავორიტებში');
};

// Instance method to remove favorite location
UserSchema.methods.removeFavoriteLocation = function(locationId) {
    this.favoriteLocations = this.favoriteLocations.filter(
        fav => fav._id.toString() !== locationId
    );
    return this.save();
};

// Static method to find user by email
UserSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Virtual for user's age (if we had birthdate)
UserSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialised
UserSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('User', UserSchema);