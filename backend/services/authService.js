import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { validateQuizStreak } from "../utils/quizStreakHelper.js";

// Return user details without exposing the password
const formatUser = (user) => ({
    userId: user.id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    streak: user.streak ?? 0,
    streakDate: user.streakDate ?? null,
});

// Generate a JWT valid for 7 days
const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register a new user
export const signupUser = async (username, email, password) => {

    // Check for an existing email or username
    const existing = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }]
        }
    });

    if (existing) {
        const msg = existing.email === email ? "Email already registered" : "Username already taken";
        const err = new Error(msg);
        err.statusCode = 400;
        throw err;
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { username, email, password: hashedPassword }
    });

    const token = signToken(user.id);
    return { user: formatUser(user), token };
};

// Authenticate an existing user
export const signinUser = async (email, password) => {

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        const err = new Error("Email not registered");
        err.statusCode = 401;
        throw err;
    }

    // Compare the password with the stored hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        const err = new Error("Invalid Password");
        err.statusCode = 401;
        throw err;
    }

    const token = signToken(user.id);

    // Reset the streak if the user missed too many days
    const updatedUser = await validateQuizStreak(user);

    return { user: formatUser(updatedUser || user), token };
};

// Update the provided profile fields
export const updateUserProfile = async (user, fields) => {
    const { username, email, profileImage, streak, streakDate } = fields;

    const data = {};
    if (username)             data.username = username;
    if (email)                data.email = email;
    if (profileImage)         data.profileImage = profileImage;
    if (streak !== undefined) data.streak = streak;
    if (streakDate)           data.streakDate = new Date(streakDate);

    const updated = await prisma.user.update({
        where: { id: user.id },
        data
    });

    return formatUser(updated);
};

// Change password after verifying the current one
export const changeUserPassword = async (userId, currentPassword, newPassword) => {

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        const err = new Error("Invalid current Password");
        err.statusCode = 401;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });
};