import { Routes } from "@angular/router";
import { AuthGuard } from "./../../core/guard/auth.guard";

import { Error404Component } from './../../components/page/error404/error404.component';

export const content: Routes = [
    {
        path: "",
        loadChildren: () => import("../../components/themes/themes.module").then((m) => m.ThemesModule),
        title: 'Home | Your Cool Fashion'
    },
    {
        path: 'privacy-policy',
        loadChildren: () =>
            import('../../privacy-policy/privacy-policy.module').then(
                (m) => m.PrivacyPolicyModule
            ),
        title: 'Privacy Policy | Your Cool Fashion'
    },

    {
        path: 'return-exchange',
        loadChildren: () =>
            import('../../return-exchange/return-exchange.module').then(
                (m) => m.ReturnExchangeModule
            ),
        title: 'Return & Exchange Policy | Your Cool Fashion'
    },

    {
        path: 'term-condition',
        loadChildren: () =>
            import('../../term-condition/term-condition.module').then(
                (m) => m.TermConditionModule
            ),
        title: 'Terms & Conditions | Your Cool Fashion'
    },

    {
        path: 'Refund-and-Cancellation-Policy',
        loadChildren: () =>
            import('../../refund-and-cancellation-policy/refund-and-cancellation-policy.module').then(
                (m) => m.RefundAndCancellationPolicyModule
            ),
        title: 'Refund & Cancellation Policy | Your Cool Fashion'
    },

    {
        path: "shipping-delivery",
        loadChildren: () => import("../../shipping-delevary/shipping-delevary.module").then((m) => m.ShippingDelevaryModule),
        title: 'Shipping & Delivery | Your Cool Fashion'
    },

    {
        path: "aboutus",
        loadChildren: () => import("../../about-us/about-us.module").then((m) => m.AboutUsModule),
        title: 'About Us | Your Cool Fashion'
    },

    {
        path: "Contact-Us",
        loadChildren: () => import("../../contact-us/contact-us.module").then((m) => m.ContactUsModule),
        title: 'Contact Us | Your Cool Fashion'
    },

    {
        path: "auth",
        loadChildren: () => import("../../components/auth/auth.module").then((m) => m.AuthModule),
        canActivateChild: [AuthGuard],
        title: 'Login / Register | Your Cool Fashion'
    },
    {
        path: "account",
        loadChildren: () => import("../../components/account/account.module").then((m) => m.AccountModule),
        canActivate: [AuthGuard],
        title: 'My Account | Your Cool Fashion'
    },
    {
        path: "",
        loadChildren: () => import("../../components/shop/shop.module").then((m) => m.ShopModule),
        title: 'Shop | Your Cool Fashion'
    },
    {
        path: "",
        loadChildren: () => import("../../components/blog/blog.module").then((m) => m.BlogModule),
        title: 'Blog | Your Cool Fashion'
    },
    {
        path: "",
        loadChildren: () => import("../../components/page/page.module").then((m) => m.PagesModule),
        title: 'Pages | Your Cool Fashion'
    },
    {
        path: '**',
        pathMatch: 'full',
        component: Error404Component,
        title: '404 - Page Not Found | Your Cool Fashion'
    }
]
