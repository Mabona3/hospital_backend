import mongoose from 'mongoose';
const { Schema } = mongoose;

const AppointmentSchema = new Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    date: {
        type: Date,
        required: true
    }
});

export const Appointments = mongoose.model("Appointment", AppointmentSchema);
