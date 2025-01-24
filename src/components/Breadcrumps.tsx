import React, {ReactElement} from "react";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {SidebarData} from "@/data/SidebarData";

export function Breadcrumbs({routes = []}: {routes: string[]}) {
    let fullHref: string | undefined = undefined;
    const breadcrumbItems: ReactElement[] = [];
    let breadcrumbPage: ReactElement = (<></>);

    for(let i = 0; i < routes.length; i++) {
        const sidetebarName = SidebarData["navMain"][0].items.find((item) => item.url === `/${routes[i]}`)

        console.log("R", SidebarData["navMain"])
        const route = sidetebarName ? sidetebarName.title : routes[i];
        const href: string = fullHref ? `${fullHref}/${route}` : `/${route}`;

        fullHref = href

        if (i === routes.length-1) {
            breadcrumbPage = (
                <BreadcrumbItem>
                    <BreadcrumbPage>{route}</BreadcrumbPage>
                </BreadcrumbItem>
            )
        } else {
            breadcrumbItems.push(
                <React.Fragment key={href}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={href}>{route}</BreadcrumbLink>
                    </BreadcrumbItem>
                </React.Fragment>
            )
        }
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Главная</BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems}
                <BreadcrumbSeparator />
                {breadcrumbPage}
            </BreadcrumbList>
        </Breadcrumb>
    )
}