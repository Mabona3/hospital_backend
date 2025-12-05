import mongoose from 'mongoose';
const { Schema } = mongoose;

const patientSchema = new Schema({
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
});

export const Patients = mongoose.model("Patient", patientSchema);
