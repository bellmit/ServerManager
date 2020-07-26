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
import * as fs from "fs";

import { Injectable } from "../../Injector";
import { IniParser, Section } from "../../Model/IniParser";
import { SMB } from "srvmgr-api";
import { CommandExecutor } from "../../services/CommandExecutor";
import { PermissionsManager, POSIXAuthority } from "../../services/PermissionsManager";
import { IniWriter } from "../../Model/IniWriter";

@Injectable
export class SambaManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public async AddShare(share: SMB.Share, session: POSIXAuthority)
    {
        const settings = this.QuerySettings();
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

    public QuerySettings()
    {
        const data = fs.readFileSync("/etc/samba/smb.conf", "utf-8");
        const parser = new IniParser(data, ["#", ";"], { "no": false, "yes": true });

        const sections = parser.Parse();
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
        const settings = this.QuerySettings();
        const index = settings.shares.findIndex(share => share.name === oldShareName);
        settings.shares.Remove(index);

        settings.shares.push(share);

        await this.WriteSettings(settings.global!, settings.shares, session);
    }

    //Private methods
    private MapSectionToShare(sectionName: string, section: Section): SMB.Share
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
                const n = typeof value === "number" ? value : parseInt(s);

                switch(key)
                {
                    case "browseable":
                        p.browseable = b;
                        break;
                    case "create mask":
                        p.createMask = n;
                        break;
                    case "comment":
                        p.comment = s;
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

    private async WriteSettings(global: SMB.GlobalSettings, shares: SMB.Share[], session: POSIXAuthority)
    {
        const data: any = { global };

        for (const share of shares)
        {
            const p = share.properties;

            data[share.name] = {
                "guest ok": p.allowGuests,
                "browseable": p.browseable,
                comment: p.comment,
                "create mask": p.createMask,
                path: p.path,
                printable: p.printable,
                writable: p.writable,
            };
        }

        const writer = new IniWriter("no", "yes");
        fs.writeFileSync("/etc/samba/smb.conf", writer.Write(data), "utf-8");

        await this.commandExecutor.ExecuteCommand(["smbcontrol", "smbd", "reload-config"], this.permissionsManager.Sudo(session.uid));
    }
}