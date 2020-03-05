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
import { PluginDefinition } from "./Model/PluginDefinition";
import * as Backup from "./Plugins/Backup/plugin";
import * as ExternalConnections from "./Plugins/ExternalConnections/plugin";
import * as Filemanager from "./Plugins/Filemanager/plugin";
import * as Modules from "./Plugins/Modules/plugin";
import * as Settings from "./Plugins/Settings/plugin";
import * as SMB from "./Plugins/SMB/plugin";
import * as SystemUpdate from "./Plugins/SystemUpdate/plugin";
import * as Users from "./Plugins/Users/plugin";

export const plugins: PluginDefinition[] = [
    Backup.plugin,
    ExternalConnections.plugin,
    Filemanager.plugin,
    Modules.plugin,
    Settings.plugin,
    SMB.plugin,
    SystemUpdate.plugin,
    Users.plugin,
];