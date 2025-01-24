import { PrismaClient } from '@prisma/client';
import React from 'react';
import {WorkoutsTable} from "@/app/workouts/WorkoutsTable";

const prisma = new PrismaClient()

const WorkoutsPage = async () => {
    const workouts = await prisma.workout.findMany({
        include: {
            exercises: true
        }
    });
    const exercises = await prisma.exercise.findMany();
    return <WorkoutsTable data={workouts} exerciseData={exercises} />;
};

export default WorkoutsPage;
