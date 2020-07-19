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

const MSG_JDOWNLOADER = "/JDownloader/";

export interface MyJDownloaderCredentials
{
    userName: string;
    password: string;
}

export namespace Api
{
    export namespace QuerySettings
    {
        export const message = MSG_JDOWNLOADER + SUBMSG_QUERY;

        export type ResultData = MyJDownloaderCredentials;
    }

    export namespace SetSettings
    {
        export const message = MSG_JDOWNLOADER + SUBMSG_SET;

        export type RequestData = MyJDownloaderCredentials;
    }
}