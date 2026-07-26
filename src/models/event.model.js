import { Schema, Model, model } from "mongoose";
const eventSchema = new Schema({

    name: String,
    date: Date,
    place: String,
    price: Number,
    status: Boolean

});

export const eventModel= model ("event", eventSchema);