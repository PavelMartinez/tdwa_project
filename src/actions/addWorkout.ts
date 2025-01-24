"use server";

import {PrismaClient} from "@prisma/client";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {secondsToTime} from "@/lib/utils";

const prisma = new PrismaClient();

export async function addWorkout(initialState: { message: string; }, formData: FormData)
{
    const validationSchema = z.object({
        description: z.string().trim().min(1, { message: "Описание обязательно" }),
        exercises: z.string().array().min(1, { message: "Упражнения обязательно" }),
        duration: z.number().gte(60, "Продолжительность >= 1 мин").lte(9000, "Продолжительность < 150 мин"),
    });
    const exercises = String(formData.get("exercises"));
    const validatedExerciseFormData = validationSchema.safeParse({
        description: formData.get("description"),
        duration: Number(formData.get("duration")) * 60,
        exercises: exercises ? JSON.parse(exercises) : []
    });

    console.log(validatedExerciseFormData.data)

    if(validatedExerciseFormData.error)
    {
        return {
            message: validatedExerciseFormData.error.issues[0].message
        }
    }

    const exercisesData = await prisma.exercise.findMany({
        where: {
            id: { in: validatedExerciseFormData.data?.exercises }
        },
        include: {
            type: true
        }
    })

    if(exercisesData)
    {
        const commulativeDuration = exercisesData.reduce((acc: number, value) => {
            acc += value.duration;
            return acc;
        }, 0);

        const commulativeDifficulty = exercisesData.reduce((acc: number, value) => {
            acc += value.type.difficulty;
            return acc;
        }, 0);

        if(commulativeDuration > validatedExerciseFormData.data?.duration)
        {
            return { message: `Суммарная продолжительность упраженений (${secondsToTime(commulativeDuration)}) больше продолжительности тренировки (${secondsToTime(validatedExerciseFormData.data?.duration)})` }
        }
        if(commulativeDifficulty > 12)
        {
            return { message: `Суммарная сложность упраженений (${commulativeDifficulty}) больше 12` }
        }
    }

    const newWorkout = await prisma.workout.create({
        data: {
            description: validatedExerciseFormData.data?.description,
            duration: validatedExerciseFormData.data?.duration,
            exercises: {
                connect: validatedExerciseFormData.data?.exercises.map((value) => ({
                    id: value
                }))
            }
        }
    })

    if(newWorkout)
    {
        revalidatePath("/workouts")
        return {
            message: `Успешно добавлено упражнение ${newWorkout.id}`
        }
    }

    return {
        message: `Неизвестная ошибка`
    }
}