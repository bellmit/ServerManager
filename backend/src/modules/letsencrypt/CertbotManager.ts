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

import { Injectable } from "../../Injector";
import { CommandExecutor } from "../../services/CommandExecutor";
import { NotificationsManager } from "../../services/NotificationsManager";
import { POSIXAuthority, PermissionsManager } from "../../services/PermissionsManager";
import { CertificatesApi } from "srvmgr-api";

@Injectable
export class CertbotManager
{
    constructor(private commandExecutor: CommandExecutor, private notificationsManager: NotificationsManager, private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public async CreateCertificate(domainName: string, email: string, session: POSIXAuthority)
    {
        const commands = ["certbot", "certonly", "--webroot", "-w", "/var/www/html/", "-d", domainName, "-m", email, "--agree-tos"];
        await this.commandExecutor.ExecuteCommand(commands, this.permissionsManager.Sudo(session.uid));
    }

    public async ListCertificates(session: POSIXAuthority)
    {
        const result = await this.commandExecutor.ExecuteCommand(["certbot", "certificates"], this.permissionsManager.Sudo(session.uid));

        const certs: CertificatesApi.List.Certificate[] = [];

        const lines = result.stdout.split("\n");
        for (let index = 0; index < lines.length; index++)
        {
            const line = lines[index];

            const parts = line.split(":");
            if( (parts.length == 2) && (parts[0].trim() === "Certificate Name") )
            {
                const expiry = lines[index+2].trim().substring("Expiry Date: ".length).split(" ");
                const expiryDate = new Date(expiry[0] + " " + expiry[1]);

                const certPath = lines[index+3].trim().substring("Certificate Path:".length).trim();
                const keyPath = lines[index+4].trim().substring("Private Key Path:".length).trim();

                certs.push({ name: parts[1].trim(), expiryDate: expiryDate.toISOString(), certificatePath: certPath, privateKeyPath: keyPath });

                index += 4;
            }
        }

        return certs;
    }
}