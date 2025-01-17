import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
});

const BookSchema = new Schema({
    title: { type: String, required: [true, "Le titre est obligatoire."] },
    author: { type: String, required: [true, "L'auteur est obligatoire."] },
    publishedDate: { type: Date },
    category: { type: String },
    rating: {
        type: Number,
        default: 0,
        min: [0, "La note ne peut pas être inférieure à 0."],
        max: [5, "La note ne peut pas dépasser 5."],
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviews: [ReviewSchema],
});

BookSchema.virtual("averageRating").get(function () {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / this.reviews.length).toFixed(2); 
});

BookSchema.set("toJSON", { virtuals: true });

export default models.Book || model("Book", BookSchema);
