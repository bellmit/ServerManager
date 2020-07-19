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

import { SUBMSG_QUERY, SUBMSG_LIST, SUBMSG_ENABLE, SUBMSG_SET } from "../Messages";

const MSG_APACHE = "/Apache/";
const MSG_APACHE_MODULES = MSG_APACHE + "Modules/";
const MSG_APACHE_PORTS = MSG_APACHE + "Ports/";
const MSG_APACHE_SITES = MSG_APACHE + "Sites/";

interface ChangeEnabledStatusData
{
    siteName: string;
    enabled: boolean;
}

export interface EntityOverviewInfo
{
    name: string;
    enabled: boolean;
}

export interface SSLModuleProperties
{
    certificateFile: string;
    keyFile: string;
}

export interface VirtualHostProperties
{
    serverAdmin: string;
    documentRoot: string;
    errorLog: string;
    customLog: string;

    mod_ssl?: SSLModuleProperties;
}

interface VirtualHost extends VirtualHostProperties
{
    addresses: string;
}

export namespace Api
{
    export namespace EnableDisableModule
    {
        export const message = MSG_APACHE_MODULES + SUBMSG_ENABLE;

        export type RequestData = ChangeEnabledStatusData;
    }

    export namespace EnableDisableSite
    {
        export const message = MSG_APACHE_SITES + SUBMSG_ENABLE;

        export type RequestData = ChangeEnabledStatusData;
    }

    export namespace ListModules
    {
        export const message = MSG_APACHE_MODULES + SUBMSG_LIST;
    }

    export namespace ListPorts
    {
        export const message = MSG_APACHE_PORTS + SUBMSG_LIST;
    }

    export namespace ListSites
    {
        export const message = MSG_APACHE_SITES + SUBMSG_LIST;

        export type ResultData = EntityOverviewInfo[];
    }

    export namespace QuerySite
    {
        export const message = MSG_APACHE_SITES + SUBMSG_QUERY;

        export type RequestData = string;
        export type ResultData = VirtualHost;
    }

    export namespace SetPorts
    {
        export const message = MSG_APACHE_PORTS + SUBMSG_SET;
    }

    export namespace SetSite
    {
        export const message = MSG_APACHE_SITES + SUBMSG_SET;
        export interface RequestData extends VirtualHost
        {
            siteName: string;
        }
        export type ResultData = boolean;
    }
}