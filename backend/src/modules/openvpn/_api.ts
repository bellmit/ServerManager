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
import path from "path";

import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, ApiRequest } from "../../Api";
import { OpenVPNApi } from "srvmgr-api";
import { CertificateManager } from "./CertificateManager";
import { OpenVPNManager } from "./OpenVPNManager";
import { domain } from "process";

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

    @WebSocketAPIEndpoint({ route: OpenVPNApi.DeleteConfig.message })
    public async DeleteConfig(request: ApiRequest, configName: OpenVPNApi.DeleteConfig.RequestData)
    {
        return this.openVPNManager.DeleteConfig(configName, request.session);
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.DownloadClientConfig.message })
    public async DownloadClientConfig(request: ApiRequest, data: OpenVPNApi.DownloadClientConfig.RequestData): Promise<OpenVPNApi.DownloadClientConfig.ResultData>
    {
        const caDirName = await this.openVPNManager.QueryCADirName(data.configName, request.session);
        const domainName = await this.certificateManager.QueryDomainName(caDirName, request.session);
        const paths = await this.certificateManager.GetClientCertPaths(caDirName, data.clientName);

        return {
            config: await this.openVPNManager.GenerateClientConfig(data.configName, domainName, paths, data.dnsRedirectAddress, request.session)
        };
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.ListCADirs.message })
    public async ListCADirs(): Promise<OpenVPNApi.ListCADirs.ResultData>
    {
        return await this.certificateManager.ListCaDirs();
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.ListClients.message })
    public async ListClients(request: ApiRequest, caDirName: OpenVPNApi.ListClients.RequestData): Promise<OpenVPNApi.ListClients.ResultData>
    {
        const result = await this.certificateManager.ListClients(caDirName, request.session);
        return result.ToArray();
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.ListConfigs.message })
    public async ListConfigs(request: ApiRequest): Promise<OpenVPNApi.ListConfigs.ResultData>
    {
        const result = await this.openVPNManager.ListConfigs(request.session);
        return result.ToArray();
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.QueryCADirOfConfig.message })
    public async QueryCADirOfConfig(request: ApiRequest, data: OpenVPNApi.QueryCADirOfConfig.RequestData): Promise<OpenVPNApi.QueryCADirOfConfig.ResultData>
    {
        return this.openVPNManager.QueryCADirName(data.name, request.session);
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.QueryConfig.message })
    public async QueryConfig(request: ApiRequest, data: OpenVPNApi.QueryConfig.RequestData): Promise<OpenVPNApi.QueryConfig.ResultData>
    {
        return await this.openVPNManager.ReadServerConfig(data.name, request.session);
    }

    @WebSocketAPIEndpoint({ route: OpenVPNApi.QueryNewConfigTemplate.message })
    public async QueryNewConfigTemplate(request: ApiRequest, data: OpenVPNApi.QueryNewConfigTemplate.RequestData): Promise<OpenVPNApi.QueryNewConfigTemplate.ResultData>
    {
        const pkiPath = "/etc/easy-rsa/" + data.caDirName + "/pki/";
        const domainName = await this.certificateManager.QueryDomainName(data.caDirName, request.session);

        return {
            authenticationAlgorithm: "SHA256",
            cipher: "AES-256-CBC",
            name: "",
            port: 1194,
            protocol: "udp",
            verbosity: 3,
            virtualServerAddress: "10.8.0.0",
            virtualServerSubnetMask: "255.255.255.0",
            certKeyFiles: {
                caCertPath: path.join(pkiPath, "ca.crt"),
                certPath: path.join(pkiPath, "issued", domainName + ".crt"),
                dhPath: path.join(pkiPath, "dh.pem"),
                keyPath: path.join(pkiPath, "private", domainName + ".key"),
            }
        };
    }
}

export default LetsEncryptApi;