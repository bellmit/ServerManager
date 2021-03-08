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
import { SMB } from "srvmgr-api";
import { CommandExecutor } from "../../services/CommandExecutor";
import { PermissionsManager } from "../../services/PermissionsManager";
import { POSIXAuthority } from "../../services/POSIXAuthority";
import { SambaConfigParser } from "./SambaConfigParser";
import { ConfigModel } from "../../core/ConfigModel";
import { Dictionary } from "acts-util-core";
import { PropertyType } from "../../core/ConfigParser";
import { ConfigWriter } from "../../core/ConfigWriter";

@Injectable
export class SambaManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public async AddShare(share: SMB.Share, session: POSIXAuthority)
    {
        const settings = await this.QuerySettings();
        settings.shares.push(share);

        await this.WriteSettings(settings.global!, settings.shares, session);
    }

    public async AddUser(userName: string, password: string, session: POSIXAuthority)
    {
        const childProcess = this.commandExecutor.CreateChildProcess(["smbpasswd", "-s", "-a", userName], this.permissionsManager.Sudo(session.uid));
        childProcess.stdin.write(password);
        childProcess.stdin.write("\n");
        childProcess.stdin.write(password);
        childProcess.stdin.write("\n");

        const exitCode = await this.commandExecutor.ChildProcessToPromise(childProcess);
        return exitCode === 0;
    }

    public async DeleteShare(shareName: string, session: POSIXAuthority)
    {
        const settings = await this.QuerySettings();
        const idx = settings.shares.findIndex(share => share.name === shareName);
        if(idx === -1)
            throw new Error("Share '" + shareName + "' does not exist.");
        settings.shares.Remove(idx);

        await this.WriteSettings(settings.global!, settings.shares, session);
    }

    public async QuerySettings()
    {
        const parser = new SambaConfigParser;
        const data = await parser.Parse("/etc/samba/smb.conf");

        const mdl = new ConfigModel(data);

        const sections = mdl.AsDictionary();
        const global = sections["global"];
        delete sections["global"];

        const shares = [];

        for (const key in sections)
        {
            if (sections.hasOwnProperty(key))
            {
                const section = sections[key];
                shares.push(this.MapSectionToShare(key, section!));
            }
        }

        return { global, shares };
    }

    public async QueryUsers(session: POSIXAuthority): Promise<SMB.User[]>
    {
        const result = await this.commandExecutor.ExecuteCommand(["pdbedit", "-L", "-v"], this.permissionsManager.Sudo(session.uid));
        const lines = result.stdout.split("\n");

        const users: SMB.User[] = [];
        for (let index = 0; index < lines.length; index++)
        {
            const line = lines[index];
            const match = line.match(/^Unix username:[ \t]+([a-z]+)$/);
            if(match !== null)
            {
                const flagsLine = lines[index + 2].substr("Account Flags:".length);

                users.push({ name: match[1], enabled: flagsLine.indexOf("D") === -1 });
                index += 1;
            }
        }
        return users;
    }

    public async SetShare(oldShareName: string, share: SMB.Share, session: POSIXAuthority)
    {
        const settings = await this.QuerySettings();
        const index = settings.shares.findIndex(share => share.name === oldShareName);
        settings.shares.Remove(index);

        settings.shares.push(share);

        await this.WriteSettings(settings.global!, settings.shares, session);
    }

    //Private methods
    private MapSectionToShare(sectionName: string, section: Dictionary<PropertyType>): SMB.Share
    {
        const share: SMB.Share = SMB.CreateDefaultShare(sectionName);
        const p = share.properties;

        for (const key in section)
        {
            if (section.hasOwnProperty(key))
            {
                const value = section[key]!;

                const b = value === true;
                const s = value.toString();
                const n8 = typeof value === "number" ? value : parseInt(s, 8);

                switch(key)
                {
                    case "browseable":
                        p.browseable = b;
                        break;
                    case "create mask":
                        p.createMask = n8;
                        break;
                    case "comment":
                        p.comment = s;
                        break;
                    case "directory mask":
                        p.directoryMask = n8;
                        break;
                    case "guest ok":
                        p.allowGuests = b;
                        break;
                    case "path":
                        p.path = s;
                        break;
                    case "printable":
                        p.printable = b;
                        break;
                    case "read only":
                        p.writable = !b;
                        break;
                    case "valid users":
                        p.validUsers = s.split(" ");
                        break;
                    case "writable":
                        p.writable = b;
                        break;
                    default:
                        throw new Error("Unknown property: " + key);
                }
            }
        }

        return share;
    }

    private ToOctal(n: number)
    {
        let string = n.toString(8);
        while(string.length < 4)
            string = "0" + string;

        return string;
    }

    private async WriteSettings(global: SMB.GlobalSettings, shares: SMB.Share[], session: POSIXAuthority)
    {
        const parser = new SambaConfigParser;
        const cfgEntries = await parser.Parse("/etc/samba/smb.conf");

        const mdl = new ConfigModel(cfgEntries);

        mdl.SetProperties("global", global);
        const shareNamesToDelete = mdl.sectionNames.Filter(x => x !== "global").ToSet();

        for (const share of shares)
        {
            const p = share.properties;
            mdl.SetProperties(share.name, {
                "guest ok": p.allowGuests,
                "browseable": p.browseable,
                comment: p.comment,
                "create mask": this.ToOctal(p.createMask),
                "directory mask": this.ToOctal(p.directoryMask),
                path: p.path,
                printable: p.printable,
                "valid users": p.validUsers.join(" "),
                writable: p.writable,
            });

            shareNamesToDelete.delete(share.name);
        }

        for (const shareNameToDelete of shareNamesToDelete)
        {
            mdl.DeleteSection(shareNameToDelete.toString());
        }

        const writer = new ConfigWriter( x => x, "no", "yes");
        await writer.Write("/etc/samba/smb.conf", cfgEntries);

        await this.commandExecutor.ExecuteCommand(["smbcontrol", "smbd", "reload-config"], this.permissionsManager.Sudo(session.uid));
    }
}