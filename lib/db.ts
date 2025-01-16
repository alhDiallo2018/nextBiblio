import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
    const connectionState = mongoose.connection.readyState;

    if(connectionState === 1){
        console.log("Vous êtes déja connecté");

        return;
    }
    if(connectionState === 2){
        console.log("Connecting...");

        return;
    }

    try{
        mongoose.connect(MONGODB_URI !,{
            dbName: "nextBliblio",
            bufferCommands: false
        })

        console.log("connected")
    } catch(error) {
        console.log("error in connecting database", error);
        throw new Error("Error connecting database");
    }
}

export default connect; 