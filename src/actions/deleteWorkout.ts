"use server";

import {PrismaClient} from "@prisma/client";
import {z} from "zod";
import {revalidatePath} from "next/cache";

const prisma = new PrismaClient();

export async function deleteWorkout(id: string)
{
    const validationSchema = z.object({
        id: z.string().uuid()
    });
    const validatedExerciseFormData = validationSchema.safeParse({
        id: id
    });

    if(validatedExerciseFormData.error)
    {
        return {
            message: validatedExerciseFormData.error.issues[0].message
        }
    }

    const deleteExerciseType = await prisma.workout.delete({
        where: {
            id: validatedExerciseFormData.data?.id
        }
    })

    if(deleteExerciseType)
    {
        revalidatePath("/workouts")
        return {
            message: `ok`
        }
    }

    return {
        message: `Неизвестная ошибка`
    }
}