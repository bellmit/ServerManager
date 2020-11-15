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

import { GlobalInjector } from "../src/Injector";
import { CertificateManager } from "../src/modules/openvpn/CertificateManager";
import { SystemServicesManager } from "../src/services/SystemServicesManager";

//TODO: Make real tests


async function ASync()
{
    await GlobalInjector.Resolve(SystemServicesManager).FetchServicesSnapshot({ gid: 0, uid: 0 });

    const session = { uid: 0, gid: 0 };
    if(fs.existsSync("/etc/openvpn/test"))
        fs.rmdirSync("/etc/openvpn/test", { recursive: true });

    const cm = GlobalInjector.Resolve(CertificateManager);

    //await cm.CreateCa("test", session);

    fs.chmodSync("/etc/openvpn/test", 0o777);
    return;
}

ASync();