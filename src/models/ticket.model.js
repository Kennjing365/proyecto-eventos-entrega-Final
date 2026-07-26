import { Schema, Types, model, types}  from "mongoose"

const ticketShema = new Schema({
    user:{

        type: Types.ObjectId,
        ref: "user"
    },
    event:{
        type: Types.ObjectId, 
        ref: "event"
    }

});

export const ticketShema = model("ticket", ticketShema);