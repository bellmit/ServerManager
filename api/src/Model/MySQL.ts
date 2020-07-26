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

import { SUBMSG_QUERY, SUBMSG_SET } from "../Messages";

const MSG_MYSQL = "/MySQL/";
const MSG_MYSQL_SETTINGS = MSG_MYSQL + "Settings/";

export interface MysqldSettings
{
    "default-time-zone"?: string;
}

export namespace Api
{
    export namespace QueryMysqldSettings
    {
        export const message = MSG_MYSQL_SETTINGS + SUBMSG_QUERY;

        export type ResultData = MysqldSettings;
    }

    export namespace SaveMysqldSettings
    {
        export const message = MSG_MYSQL_SETTINGS + SUBMSG_SET;

        export type RequestData = MysqldSettings;
    }
}