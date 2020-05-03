/**
 * ServerManager
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import { Routes } from "acfrontend";

import { routes as backupRoutes } from "./Plugins/Backup/routing";
import { routes as externalConnectionsRoutes } from "./Plugins/ExternalConnections/routing";
import { routes as modulesRoutes } from "./Plugins/Modules/routing";
import { routes as settingsRoutes } from "./Plugins/Settings/routing";
import { routes as systemUpdateRoutes } from "./Plugins/SystemUpdate/routing";
import { routes as usersRoutes } from "./Plugins/Users/routing";
import { PageNotFoundComponent } from "./PageNotFoundComponent";
import { ServerStatusComponent } from "./ServerStatusComponent";
import { AuthGuard } from "./AuthGuard";
import { LoginComponent } from "./LoginComponent";

const protectedRoutes : Routes = [
    { path: "backup", children: backupRoutes },
    { path: "externalconnections", children: externalConnectionsRoutes },
    { path: "modules", children: modulesRoutes },
    { path: "settings", children: settingsRoutes },
    { path: "systemupdate", children: systemUpdateRoutes },
    { path: "users", children: usersRoutes },
    { path: "", component: ServerStatusComponent },
];

for (const route of protectedRoutes)
    route.guards = [AuthGuard];

export const routes : Routes = protectedRoutes.concat([
    { path: "login", component: LoginComponent},
    { path: "*", component: PageNotFoundComponent},
]);