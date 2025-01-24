"use server";

import {PrismaClient} from "@prisma/client";
import {z} from "zod";
import {revalidatePath} from "next/cache";

const prisma = new PrismaClient();

export async function addExerciseType(initialState: { message: string; }, formData: FormData)
{
    console.log("lol")
    const validationSchema = z.object({
        name: z.string().trim().min(1, { message: "Название обязательно" }),
        difficulty: z.number().gte(1, "Сложность в диапазоне [1; 10]").lte(10, "Сложность в диапазоне [1; 10]"),
    });
    const validatedExerciseFormData = validationSchema.safeParse({
        name: formData.get("name"),
        difficulty: Number(formData.get("difficulty"))
    });

    if(validatedExerciseFormData.error)
    {
        return {
            message: validatedExerciseFormData.error.issues[0].message
        }
    }

    const newExerciseType = await prisma.exerciseType.create({
        data: {
            name: validatedExerciseFormData.data?.name,
            difficulty: validatedExerciseFormData.data?.difficulty
        }
    })

    if(newExerciseType)
    {
        revalidatePath("/exercises")
        return {
            message: `Успешно добавлена сложность ${newExerciseType.name}`
        }
    }

    return {
        message: `Неизвестная ошибка`
    }
}