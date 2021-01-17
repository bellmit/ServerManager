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
import { ConfigModel } from "../src/core/ConfigModel";
import { GlobalInjector } from "../src/Injector";
import { SambaConfigParser } from "../src/modules/samba/SambaConfigParser";
import { SambaManager } from "../src/modules/samba/SambaManager";

//TODO: Make real tests


async function ASync()
{
    const cfgp = new SambaConfigParser;
    const e = await cfgp.Parse("/etc/samba/smb.conf");
    const mdl = new ConfigModel(e);

    console.log(mdl.AsDictionary());

    console.log("NEW");
    const data = await GlobalInjector.Resolve(SambaManager).QuerySettings();
    console.log(data.shares);
}

ASync();