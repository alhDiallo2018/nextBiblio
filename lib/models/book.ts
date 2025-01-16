import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: {type: String, required: true },
    rating: {type: Number, required: true, min: 1, max: 5 },
    createdAt: {type: Date, default: Date.now },
});

const BookSchema = new Schema({
    title: {type: String, required: true },
    author: {type: String, required: true },
    publishedDate: {type: Date },
    category: {type: String},
    rating: {type: Number, default: 0 }, 
    reviews: [ReviewSchema],
});

export default models.Book || model("Book", BookSchema);
