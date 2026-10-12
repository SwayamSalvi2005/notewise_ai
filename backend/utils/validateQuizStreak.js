//Track and validate a user's daily quiz completion streak
import prisma from "../config/prisma.js";


// Called when a quiz is submitted successfully.
// Returns the updated user object, or the original if no change was needed.
export const updateQuizStreak = async (user) => {
    const today = new Date();

    // Build the data object to update in the DB
    let updateData = null;

    if (!user.streakDate) {
        // First time ever completing a quiz
        updateData = { streak: 1, streakDate: new Date() };

    } else {
        const lastDate = new Date(user.streakDate);

        // Reset both to midnight to compare DATES, not TIMES
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Calculate how many days have passed since last quiz
        const diff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diff === 0) {
            // Same day — already counted today, no change needed
            return user; // return unchanged user
        } else if (diff === 1) {
            // Consecutive day — increment the streak
            updateData = { streak: user.streak + 1, streakDate: new Date() };
        } else {
            // Missed one or more days — reset to 1
            updateData = { streak: 1, streakDate: new Date() };
        }
    }

    
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data:  updateData
    });

    return updatedUser;
};

// Called when a user SIGNS IN.
// If they missed more than 1 day since their last quiz, reset streak to 0.
// Returns the updated user (or original user if no reset was needed).
export const validateQuizStreak = async (user) => {
    if (!user.streakDate) return user; // never had a streak, nothing to validate

    const today    = new Date();
    const lastDate = new Date(user.streakDate);

    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diff > 1) {
        // Missed more than 1 day → streak is broken → reset completely
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data:  { streak: 0, streakDate: null }
        });
        return updatedUser;
    }

    return user; // streak is still valid, no change
};