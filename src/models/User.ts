import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: 'User' | 'Admin';
    rooms: mongoose.Types.ObjectId[];
    games: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    refreshTokens: string[];
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String },
        googleId: { type: String, unique: true, sparse: true },
        role: { type: String, enum: ['User', 'Admin'], default: 'User' },
        rooms: [{ type: mongoose.Schema.ObjectId, ref: 'Room' }],
        games: [{ type: mongoose.Schema.ObjectId, ref: 'Game' }],
        refreshTokens: { type: [String], default: [] }
    },
    { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
