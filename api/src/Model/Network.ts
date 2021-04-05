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

import { SUBMSG_QUERY, SUBMSG_SET } from "../Messages";

const MSG_NETWORK = "/Network/";

interface NetworkSettings
{
    isIPForwardingEnabled: boolean;
}

export namespace API
{
    export namespace QuerySettings
    {
        export const message = MSG_NETWORK + SUBMSG_QUERY;

        export interface RequestData
        {
        }

        export interface ResultData extends NetworkSettings
        {
        }
    }

    export namespace SaveSettings
    {
        export const message = MSG_NETWORK + SUBMSG_SET;

        export interface RequestData extends NetworkSettings
        {
        }

        export interface ResultData
        {
        }
    }
}