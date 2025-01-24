import {Breadcrumbs} from "@/components/Breadcrumps";

type Props = {
    params: Promise<{
        catchAll: string[]
    }>
}
export default async function BreadcrumbsSlot({params}: Props) {
    const { catchAll } = await params;
    console.log("rendering ", catchAll)
    return <Breadcrumbs routes={catchAll} />
}