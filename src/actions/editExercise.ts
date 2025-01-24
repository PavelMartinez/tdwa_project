"use server";

import {PrismaClient} from "@prisma/client";
import {z} from "zod";
import {revalidatePath} from "next/cache";

const prisma = new PrismaClient();

export async function editExercise(initialState: { message: string; }, formData: FormData)
{
    const validationSchema = z.object({
        description: z.string().trim().min(1, { message: "Описание обязательно" }),
        exerciseTypeId: z.string().uuid(),
        id: z.string().uuid(),
        duration: z.number().gte(1, "Продолжительность в диапазоне [1; 3600]").lte(3600, "Сложность в диапазоне [1; 3600]"),
    });
    const validatedExerciseFormData = validationSchema.safeParse({
        description: formData.get("description"),
        duration: Number(formData.get("duration")),
        exerciseTypeId: formData.get("exerciseTypeId"),
        id: formData.get("id")
    });

    if(validatedExerciseFormData.error)
    {
        return {
            message: validatedExerciseFormData.error.issues[0].message
        }
    }

    const exerciseUpdated = await prisma.exercise.update({
        where: {
            id: validatedExerciseFormData.data?.id
        },
        data: {
            description: validatedExerciseFormData.data?.description,
            duration: validatedExerciseFormData.data?.duration,
            exerciseTypeId: validatedExerciseFormData.data?.exerciseTypeId
        }
    })

    if(exerciseUpdated)
    {
        revalidatePath("/exercises")
        return {
            message: `Успешно изменено упражнение ${validatedExerciseFormData.data?.id}`
        }
    }

    return {
        message: `Неизвестная ошибка`
    }
}