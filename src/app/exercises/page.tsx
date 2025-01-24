import { PrismaClient } from '@prisma/client';
import React from 'react';
import {WorkoutsTable} from "@/app/workouts/WorkoutsTable";
import {ExercisesTable} from "@/app/exercises/ExercisesTable";
import {ExerciseTypesTable} from "@/app/exercises/ExerciseTypesTable";

const prisma = new PrismaClient()

const WorkoutsPage = async () => {
    const exercises = await prisma.exercise.findMany({
        include: {
           type: true
        }
    });
    console.log(exercises)
    const exerciseTypes = await prisma.exerciseType.findMany();
    return (
        <>
            <h2 className="text-4xl font-extrabold dark:text-white">Упражнения</h2>
            <ExercisesTable data={exercises} types={exerciseTypes}/>
            <h2 className="text-4xl font-extrabold dark:text-white">Типы упражнений</h2>
            <ExerciseTypesTable data={exerciseTypes}/>
        </>
    );
};

export default WorkoutsPage;
