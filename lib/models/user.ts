import bcrypt from "bcrypt";
import { Document, Schema, model, models } from "mongoose";

interface IUser extends Document {
    email: string;
    username: string;
    password: string;
    encryptPassword(password: string): Promise<string>;
    matchPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true }
});

UserSchema.methods.encryptPassword = async function(password: string): Promise<string> {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error("Erreur lors du cryptage du mot de passe");
    }
};

UserSchema.methods.matchPassword = async function(password: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error("Erreur lors de la comparaison des mots de passe");
    }
};

const User = models.User || model<IUser>("User", UserSchema);

export default User;
