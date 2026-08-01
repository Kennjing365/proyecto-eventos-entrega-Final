import { Schema, Model, model } from "mongoose";
const eventSchema = new Schema({
    name: String,
    date: Date, 
    place: String,
    price: Number,
    status: Boolean,
    organizer: {
        type: Schema.Types.ObjectId,
        ref: "user"
    }
});

export const eventModel= model ("event", eventSchema);