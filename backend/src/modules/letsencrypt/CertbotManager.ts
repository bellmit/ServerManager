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
import { CommandExecutor } from "../../services/CommandExecutor";
import { PermissionsManager } from "../../services/PermissionsManager";
import { POSIXAuthority } from "../../services/POSIXAuthority";
import { SystemServicesManager } from "../../services/SystemServicesManager";
import { TaskScheduler } from "../../services/TaskScheduler";
import { ApacheManager } from "../apache/ApacheManager";

interface Certificate
{
    name: string;
    expiryDate: Date;
    certificatePath: string;
    privateKeyPath: string;
}

@Injectable
export class CertbotManager
{
    constructor(private commandExecutor: CommandExecutor, private taskScheduler: TaskScheduler, private permissionsManager: PermissionsManager,
        private apacheManager: ApacheManager, private systemServicesManager: SystemServicesManager)
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

        const certs: Certificate[] = [];

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

                certs.push({ name: parts[1].trim(), expiryDate, certificatePath: certPath, privateKeyPath: keyPath });

                index += 4;
            }
        }

        return certs;
    }

    public async Schedule()
    {
        const certs = await this.ListCertificates(this.permissionsManager.root);
        for (const cert of certs)
        {
            this.ScheduleUpdate(cert.name);
        }
    }

    //Private methods
    private ComputeUpdateTime(expiryDate: Date)
    {
        return new Date(expiryDate.setMonth(expiryDate.getMonth() - 1));
    }

    private async RenewCertificate(certName: string, session: POSIXAuthority)
    {
        const sites = await this.apacheManager.QuerySites(session);
        const enabledSiteNames = sites.Values().Filter(x => x.enabled).Map(x => x.name).ToArray();

        await enabledSiteNames.Values().Map(name => this.apacheManager.DisableSite(name, session)).PromiseAll();
        await this.apacheManager.EnableSite("000-default", session);

        await this.systemServicesManager.RestartService("apache2", session);

        try
        {
            const commands = ["certbot", "renew", "--cert-name", certName, "--no-random-sleep-on-renew"];
            await this.commandExecutor.ExecuteCommand(commands, this.permissionsManager.Sudo(session.uid));
        }
        catch(error)
        {
            await this.ResetApacheState(enabledSiteNames, session);
            throw error;
        }

        await this.ResetApacheState(enabledSiteNames, session);
    }

    private async ResetApacheState(enabledSiteNames: string[], session: POSIXAuthority)
    {
        await this.apacheManager.DisableSite("000-default", session);
        await enabledSiteNames.Values().Map(name => this.apacheManager.EnableSite(name, session)).PromiseAll();

        await this.systemServicesManager.RestartService("apache2", session);
    }

    private async ScheduleUpdate(certName: string)
    {
        const session = this.permissionsManager.root;
        const certs = await this.ListCertificates(session);
        const cert = certs.Values().Filter(x => x.name === certName).First();
        
        this.taskScheduler.OneShot(this.ComputeUpdateTime(cert.expiryDate), async () => {
            await this.RenewCertificate(certName, session);
            this.ScheduleUpdate(certName);
        }, "certbot renewal");
    }
}