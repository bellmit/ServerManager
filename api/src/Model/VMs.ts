/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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

import { SUBMSG_LIST } from "../Messages";

const messageBase = "/VMs/";

export interface VMInfo
{
    name: string;
    state: "running" | "shut off";
}

export namespace API
{
    export namespace ExecuteAction
    {
        export const message = messageBase + "action";

        export interface RequestData
        {
            vmName: string;
            action: "start" | "shutdown";
        }

        export interface ResultData
        {
        }
    }

    export namespace QueryVMs
    {
        export const message = messageBase + SUBMSG_LIST;

        export type ResultData = VMInfo[];
    }
}