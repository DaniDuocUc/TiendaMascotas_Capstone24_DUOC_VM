// @ts-ignore
import {Route} from '@angular/router';
import {initialDataResolver} from 'app/app.resolvers';
import {LayoutComponent} from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'map'},


    // Admin routes
    {
        path: '',
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'map', loadChildren: () => import('app/modules/admin/home/home.routes')},
            {path: 'alert', loadChildren: () => import('app/modules/admin/alert/alert.routes')},
            {path: 'pbi', loadChildren: () => import('app/modules/admin/report/report.routes')},
            {path: 'advanced-analytics', loadChildren: () => import('app/modules/admin/advanced-analytics/analytics.routes')},
        ]
    },


    {
        path: '**',
        redirectTo: '/map'
    }
];
