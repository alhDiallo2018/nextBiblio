import { NextResponse } from "next/server";

import connect from "@/lib/db";
import User from "@/lib/models/user";
import { Types } from "mongoose";

const ObjectId = require("mongoose").Types.ObjectId;

export const GET = async () => {
    try {
        await connect();
        const users = await User.find();
        return new NextResponse(JSON.stringify(users), { status: 200 });
    } catch (error) {
        return new NextResponse("Error in fetching users" + error, { status: 500 });
    }

};

export const POST = async (request: Request) => {
    try {
        const body = await request.json();

        await connect();
        const newUser = new User(body);
        await newUser.save();

        return new NextResponse(
            JSON.stringify({ message: "User is created ", user: newUser }),
            { status: 201 }
        );
    } catch (error) {
        return new NextResponse(
            JSON.stringify({
                message: "Error in creating user",
                error,
            }),
            {
                status: 500
            }
        )

    };
}

export const PATCH = async (request: Request) => {
    try {
        const body = await request.json();
        const { userId, newUsername } = body;
        console.log("Parsed body:", body);


        await connect();

        if (!userId?.trim() || !newUsername?.trim()) {
            console.error("Validation failed:", { userId, newUsername });
            return new NextResponse(
                JSON.stringify({ message: "ID or new username are required" }),
                { status: 400 }
            );
        }



        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { message: "Invalid userId" },
                { status: 400 }
            );
        }

        const updateUser = await User.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { username: newUsername },
            { new: true }
        );

        if (!updateUser) {
            return NextResponse.json(
                { message: "User not found or didn't update" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Username updated Successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error" },
            { status: 400 }
        );
    }
};

export const DELETE = async (request: Request) => {
    try {
        const {searchParams}= new URL(request.url);
        const userId = searchParams.get("userId");

        if(!userId){
            return new NextResponse(
                JSON.stringify({
                    message: "UserId is required",
                }),
                {
                    status: 400
                }
            )
        }

        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { message: "Invalid userId" },
                { status: 400 }
            );
        }

        await connect();

        const deleteUser = await User.findByIdAndDelete(
            new Types.ObjectId(userId)
        );

        if(!deleteUser){
            return new NextResponse(
                JSON.stringify({
                    message: "User not found",
                }),
                {
                    status: 404
                }
            )
        }

        return new NextResponse(
            JSON.stringify({
                message: "User delete successfully",
            }),
            {
                status: 200
            }
        )
    } catch (error) {
        return new NextResponse(
            JSON.stringify({
                message: "Error deleting user",
                error,
            }),
            {
                status: 500
            }
        )
    }
}