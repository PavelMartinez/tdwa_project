"use server";

import {PrismaClient} from "@prisma/client";
import {z} from "zod";
import {revalidatePath} from "next/cache";

const prisma = new PrismaClient();

export async function addExercise(initialState: { message: string; }, formData: FormData)
{
    const validationSchema = z.object({
        description: z.string().trim().min(1, { message: "Описание обязательно" }),
        exerciseTypeId: z.string().uuid(),
        duration: z.number().gte(1, "Продолжительность в диапазоне [1; 3600]").lte(3600, "Сложность в диапазоне [1; 3600]"),
    });
    const validatedExerciseFormData = validationSchema.safeParse({
        description: formData.get("description"),
        duration: Number(formData.get("duration")),
        exerciseTypeId: formData.get("exerciseTypeId")
    });

    if(validatedExerciseFormData.error)
    {
        return {
            message: validatedExerciseFormData.error.issues[0].message
        }
    }

    const newExercise = await prisma.exercise.create({
        data: {
            description: validatedExerciseFormData.data?.description,
            duration: validatedExerciseFormData.data?.duration,
            exerciseTypeId: validatedExerciseFormData.data?.exerciseTypeId,
            typeId: validatedExerciseFormData.data?.exerciseTypeId
        }
    })

    if(newExercise)
    {
        revalidatePath("/exercises")
        return {
            message: `Успешно добавлено упражнение ${newExercise.id}`
        }
    }

    return {
        message: `Неизвестная ошибка`
    }
}