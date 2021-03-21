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

import { Injectable } from "acfrontend";
import { WebSocketService } from "../../Services/WebSocketService";
import { OpenVPNApi } from "srvmgr-api";

@Injectable
export class OpenVPNService
{
    constructor(private websocketService: WebSocketService)
    {
    }

    //Public methods
    public AddClient(data: OpenVPNApi.AddClient.RequestData)
    {
        return this.websocketService.SendRequest(OpenVPNApi.AddClient.message, data);
    }

    public AddConfig(data: OpenVPNApi.AddConfig.RequestData)
    {
        return this.websocketService.SendRequest(OpenVPNApi.AddConfig.message, data);
    }

    public CreateCADir(data: OpenVPNApi.AddCA.RequestData)
    {
        return this.websocketService.SendRequest<number>(OpenVPNApi.AddCA.message, data);
    }

    public DeleteCADir(caDirName: OpenVPNApi.DeleteCADir.RequestData)
    {
        return this.websocketService.SendRequest(OpenVPNApi.DeleteCADir.message, caDirName);
    }

    public DeleteConfig(configName: OpenVPNApi.DeleteConfig.RequestData)
    {
        return this.websocketService.SendRequest(OpenVPNApi.DeleteConfig.message, configName);
    }

    public DownloadClientConfig(data: OpenVPNApi.DownloadClientConfig.RequestData)
    {
        return this.websocketService.SendRequest<OpenVPNApi.DownloadClientConfig.ResultData>(OpenVPNApi.DownloadClientConfig.message, data);
    }

    public ListCADirs()
    {
        return this.websocketService.SendRequest<OpenVPNApi.ListCADirs.ResultData>(OpenVPNApi.ListCADirs.message);
    }

    public ListClients(caDirName: OpenVPNApi.ListClients.RequestData)
    {
        return this.websocketService.SendRequest<OpenVPNApi.ListClients.ResultData>(OpenVPNApi.ListClients.message, caDirName);
    }

    public ListConfigs()
    {
        return this.websocketService.SendRequest<OpenVPNApi.ListConfigs.ResultData>(OpenVPNApi.ListConfigs.message);
    }

    public QueryCADirOfConfig(data: OpenVPNApi.QueryCADirOfConfig.RequestData)
    {
        return this.websocketService.SendRequest<OpenVPNApi.QueryCADirOfConfig.ResultData>(OpenVPNApi.QueryCADirOfConfig.message, data);
    }

    public QueryConfig(data: OpenVPNApi.QueryConfig.RequestData)
    {
        return this.websocketService.SendRequest<OpenVPNApi.QueryConfig.ResultData>(OpenVPNApi.QueryConfig.message, data);
    }

    public QueryNewConfigTemplate(data: OpenVPNApi.QueryNewConfigTemplate.RequestData)
    {
        return this.websocketService.SendRequest<OpenVPNApi.QueryNewConfigTemplate.ResultData>(OpenVPNApi.QueryNewConfigTemplate.message, data);
    }
}