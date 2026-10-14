import mongoose from 'mongoose';
const schema = new mongoose.Schema({ key: { type: String, unique: true }, count: { type: Number, default: 0 }, expiresAt: Date });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('AuthAttempt', schema);
