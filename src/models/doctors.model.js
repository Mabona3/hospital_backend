import mongoose from 'mongoose';
const { Schema } = mongoose;

const doctorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    phone_number: {
        type: String
    },
});

export const Doctors = mongoose.model("Doctor", doctorSchema);
