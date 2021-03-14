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
import { Messages, CertificatesApi } from "srvmgr-api";
import { ConnectionManager } from "../../services/ConnectionManager";
import { CertbotManager } from "./CertbotManager";

@Injectable
class LetsEncryptApi
{
    constructor(private connectionManager: ConnectionManager, private certbotManager: CertbotManager)
    {
    }

    @WebSocketAPIEndpoint({ route: CertificatesApi.Add.message })
    public async CreateCertificate(request: ApiRequest, data: CertificatesApi.Add.RequestData)
    {
        await this.certbotManager.CreateCertificate(data.domainName, data.email, request.session);
        this.connectionManager.Respond(request, undefined);
    }

    @WebSocketAPIEndpoint({ route: CertificatesApi.List.message })
    public async ListCertificates(request: ApiRequest)
    {
        const result = await this.certbotManager.ListCertificates(request.session);
        this.connectionManager.Respond(request, result);
    }
}

export default LetsEncryptApi;