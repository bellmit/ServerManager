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

import { Injectable } from "acfrontend";
import { WebSocketService } from "../../Services/WebSocketService";
import { Messages, Certificate } from "srvmgr-api";

@Injectable
export class CertificatesService
{
    constructor(private websocketService: WebSocketService)
    {
    }

    //Public methods
    public CreateCertificate(domainName: string)
    {
        return this.websocketService.SendRequest(Messages.CERTIFICATES_ADD, domainName);
    }

    public ListCertificates()
    {
        return this.websocketService.SendRequest<Certificate[]>(Messages.CERTIFICATES_LIST);
    }
}