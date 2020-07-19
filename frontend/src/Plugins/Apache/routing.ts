/**
 * ServerManager
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import { ListSitesComponent } from "./ListSitesComponent";
import { PortsComponent } from "./PortsComponent";
import { ListModulesComponent } from "./ListModulesComponent";
import { EditSiteComponent } from "./EditSiteComponent";

export const routes : Routes = [
    { path: "modules", component: ListModulesComponent },
    { path: "ports", component: PortsComponent },
    { path: "sites", component: ListSitesComponent },
    { path: "site/:siteName", component: EditSiteComponent },
    { path: "", redirect: "modules" }
];