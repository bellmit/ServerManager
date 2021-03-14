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

import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, ApiRequest } from "../../Api";
import { OpenVPNApi } from "srvmgr-api";
import { CertificateManager } from "./CertificateManager";
import { OpenVPNManager } from "./OpenVPNManager";

@Injectable
class LetsEncryptApi
{
    constructor(private certificateManager: CertificateManager, private openVPNManager: OpenVPNManager)
    {
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.AddClient.message })
    public async AddClient(request: ApiRequest, data: OpenVPNApi.AddClient.RequestData)
    {
        return await this.certificateManager.AddClient(data, request.session);
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.AddConfig.message })
    public async AddConfig(request: ApiRequest, data: OpenVPNApi.AddConfig.RequestData)
    {
        return await this.openVPNManager.AddConfig(data, request.session);
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.AddCA.message })
    public async CreateCertificate(request: ApiRequest, data: OpenVPNApi.AddCA.RequestData)
    {
        return await this.certificateManager.CreateCa(data, request.session);
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.DeleteCADir.message })
    public async DeleteCADir(request: ApiRequest, caDirName: OpenVPNApi.DeleteCADir.RequestData)
    {
        return this.certificateManager.DeleteCADir(caDirName);
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.ListCADirs.message })
    public async ListCADirs(): Promise<OpenVPNApi.ListCADirs.ResultData>
    {
        return await this.certificateManager.ListCaDirs();
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.ListClients.message })
    public async ListClients(request: ApiRequest, caDirName: OpenVPNApi.ListClients.RequestData): Promise<OpenVPNApi.ListClients.ResultData>
    {
        return await this.certificateManager.ListClients(caDirName);
    }
}

export default LetsEncryptApi;