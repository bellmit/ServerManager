/**
 * ServerManager
 * Copyright (C) 2020-2021 Amir Czwink (amir130@hotmail.de)
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

import { Injectable } from "../../Injector";
import { ApiEndpoint, ApiRequest } from "../../Api";
import { JDownloaderManager } from "./JDownloaderManager";
import { JDownloader } from "srvmgr-api";

@Injectable
class JDownloaderApi
{
    constructor(private jdownloaderManager: JDownloaderManager)
    {
    }

    @ApiEndpoint({ route: JDownloader.Api.QuerySettings.message })
    public async QuerySettings(request: ApiRequest): Promise<JDownloader.Api.QuerySettings.ResultData>
    {
        return this.jdownloaderManager.QuerySettings(request.session);
    }

    @ApiEndpoint({ route: JDownloader.Api.SetSettings.message })
    public async SetSettings(request: ApiRequest, data: JDownloader.Api.SetSettings.RequestData)
    {
        return this.jdownloaderManager.SetSettings(data, request.session);
    }
}

export default JDownloaderApi;