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

import { routes as apacheRoutes } from "./Plugins/Apache/routing";
import { routes as backupRoutes } from "./Plugins/Backup/routing";
import { routes as certificatesRoutes } from "./Plugins/Certificates/routing";
import { routes as externalConnectionsRoutes } from "./Plugins/ExternalConnections/routing";
import { routes as filemanagerRoutes } from "./Plugins/Filemanager/routing";
import { routes as jdownloaderRoutes } from "./Plugins/JDownloader/routing";
import { routes as modulesRoutes } from "./Plugins/Modules/routing";
import { routes as mysqlRoutes } from "./Plugins/MySQL/routing";
import { routes as notificationsRoutes } from "./Plugins/Notifications/routing";
import { routes as openvpnRoutes } from "./Plugins/OpenVPN/routing";
import { routes as servicesRoutes } from "./Plugins/Services/routing";
import { routes as settingsRoutes } from "./Plugins/Settings/routing";
import { routes as smbRoutes } from "./Plugins/SMB/routing";
import { routes as systemUpdateRoutes } from "./Plugins/SystemUpdate/routing";
import { routes as terminalRoutes } from "./Plugins/Terminal/routing";
import { routes as usersRoutes } from "./Plugins/Users/routing";
import { PageNotFoundComponent } from "./PageNotFoundComponent";
import { ServerStatusComponent } from "./ServerStatusComponent";
import { AuthGuard } from "./AuthGuard";
import { LoginComponent } from "./LoginComponent";

import { ApacheComponent } from "./Plugins/Apache/ApacheComponent";
import { SMBComponent } from "./Plugins/SMB/SMBComponent";
import { MySQLSettingsComponent } from "./Plugins/MySQL/MySQLSettingsComponent";
import { OpenVPNComponent } from "./Plugins/OpenVPN/OpenVPNComponent";

const protectedRoutes : Routes = [
    { path: "apache", component: ApacheComponent, children: apacheRoutes },
    { path: "backup", children: backupRoutes },
    { path: "certs", children: certificatesRoutes },
    { path: "externalconnections", children: externalConnectionsRoutes },
    { path: "filemanager", children: filemanagerRoutes },
    { path: "jdownloader", children: jdownloaderRoutes },
    { path: "modules", children: modulesRoutes },
    { path: "mysql", component: MySQLSettingsComponent, children: mysqlRoutes },
    { path: "notifications", children: notificationsRoutes },
    { path: "openvpn", component: OpenVPNComponent, children: openvpnRoutes },
    { path: "services", children: servicesRoutes },
    { path: "settings", children: settingsRoutes },
    { path: "smb", component: SMBComponent, children: smbRoutes },
    { path: "systemupdate", children: systemUpdateRoutes },
    { path: "terminal", children: terminalRoutes },
    { path: "users", children: usersRoutes },
    { path: "", component: ServerStatusComponent },
];

for (const route of protectedRoutes)
    route.guards = [AuthGuard];

export const routes : Routes = protectedRoutes.concat([
    { path: "login", component: LoginComponent},
    { path: "*", component: PageNotFoundComponent},
]);