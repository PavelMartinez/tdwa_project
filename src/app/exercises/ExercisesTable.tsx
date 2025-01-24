"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"


import { ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {Exercise, ExerciseType, Prisma} from "@prisma/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Form from "next/form";
import {addExerciseType} from "@/actions/addExerciseType";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {deleteExercise} from "@/actions/deleteExercise";
import {addExercise} from "@/actions/addExercise";
import {secondsToTime} from "@/lib/utils";
import {editExercise} from "@/actions/editExercise";

type ExerciseWithType = Prisma.ExerciseGetPayload<{
    include: {
        type: true;
    }
}>

export function ExercisesTable({ data, types }: { data: ExerciseWithType[]; types: ExerciseType[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({});
    const [stateAdd, actionAdd, isPendingAdd] = React.useActionState(addExercise, { message: "" });
    const [stateEdit, actionEdit, isPendingEdit] = React.useActionState(editExercise, { message: "" });
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState<boolean>(false);
    const [actionId, setActionId] = React.useState<string>();

    const currentActionRow = data.find((item) => item.id === actionId);

    const handleDelete = async () => {
        const result = await deleteExercise(actionId!);

        if(result.message === "ok")
        {
            setDeleteDialogOpen(false);
        }
        else {
            alert(result.message)
        }
    }

    const columns: ColumnDef<ExerciseWithType>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "description",
            header: "Описание"
        },
        {
            accessorKey: "duration",
            header: "Продолжительность (мин)",
            cell: ({row}) => {
                return (
                    <>{secondsToTime(Number(row.getValue("duration")))}</>
                )
            }
        },
        {
            header: "Тип",
            accessorKey: 'type',
            accessorFn: (row) => row.type.name, // return the desired value
        },
        {
            header: "Действия",
            enableHiding: false,
            cell: ({ row }) => {
                const exercise = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                                setEditDialogOpen(true);
                                setActionId(exercise.id);
                            }}>Изменить</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setDeleteDialogOpen(true);
                                setActionId(exercise.id);
                            }}>
                                Удалить
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]


    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Фильтр по описаниям..."
                    value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("description")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Столбцы <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Нет результатов.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Добавить упражнение</Button>
                        </DialogTrigger>
                        <DialogContent className="overflow-y-scroll max-h-screen">
                            <form action={actionAdd} onSubmit={console.log}>
                                <DialogHeader>
                                    <DialogTitle>Добавить запись</DialogTitle>
                                    <DialogDescription>
                                        Настройте новое упражнение.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="description" className="text-right">
                                            Описание
                                        </Label>
                                        <Input name="description" id="description" required className="col-span-3"/>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="duration" className="text-right">
                                            Продолжительность (сек)
                                        </Label>
                                        <Input type={"number"} name="duration" id="duration" required className="col-span-3"/>
                                    </div>
                                    <div className="grid grid-cols-1 items-center gap-4">
                                        <Select name={"exerciseTypeId"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите уровень сложности"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {types.map(type => (
                                                    <SelectItem key={type.id} value={type.id}>{type.name} ({type.difficulty} сложность)</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Добавить</Button>
                                    </DialogFooter>
                                    <div className={"flex flex-col items-center justify-center gap-10"}>
                                        {isPendingAdd && <>Загрузка...</>}
                                        {stateAdd && <>{stateAdd.message}</>}
                                    </div>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Назад
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Вперед
                    </Button>
                </div>
            </div>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Это действие невозможно отменить
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отменить</AlertDialogCancel>
                        <AlertDialogAction color={"danger"} onClick={handleDelete}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="overflow-y-scroll max-h-screen">
                    <form action={actionEdit} onSubmit={console.log}>
                        <DialogHeader>
                            <DialogTitle>Редактирование</DialogTitle>
                            <DialogDescription>
                                Измените упражнение
                            </DialogDescription>
                        </DialogHeader>
                        <input defaultValue={currentActionRow?.id} type={"text"} name={"id"} hidden />
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Описание
                                </Label>
                                <Input name="description" defaultValue={currentActionRow?.description} id="description" required className="col-span-3"/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="duration" className="text-right">
                                    Продолжительность (сек)
                                </Label>
                                <Input type={"number"} defaultValue={currentActionRow?.duration} name="duration" id="duration" required className="col-span-3"/>
                            </div>
                            <div className="grid grid-cols-1 items-center gap-4">
                                <Select name={"exerciseTypeId"} defaultValue={currentActionRow?.exerciseTypeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите уровень сложности"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map(type => (
                                            <SelectItem key={type.id} value={type.id}>{type.name} ({type.difficulty} сложность)</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Обновить</Button>
                            </DialogFooter>
                            <div className={"flex flex-col items-center justify-center gap-10"}>
                                {isPendingEdit && <>Загрузка...</>}
                                {stateEdit && <>{stateEdit.message}</>}
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
