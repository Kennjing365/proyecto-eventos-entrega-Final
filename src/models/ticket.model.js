import { Schema, model } from "mongoose"

const ticketSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'event',
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'cancelled'],
        default: 'confirmed'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    reservationCode: {
        type: String,
        required: true,
        unique: true
    },
    cancelledAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

export const ticketModel = model('ticket', ticketSchema)