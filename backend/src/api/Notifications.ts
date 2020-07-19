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

import { Injectable } from "../Injector";
import { ApiEndpoint, ApiRequest } from "../Api";
import { Messages, NotificationSettings } from "srvmgr-api";
import { ConnectionManager } from "../services/ConnectionManager";
import { NotificationsManager } from "../services/NotificationsManager";

@Injectable
class NotificationsApi
{
    constructor(private notificationsManager: NotificationsManager, private connectionManager: ConnectionManager)
    {
    }

    @ApiEndpoint({ route: Messages.NOTIFICATIONS_QUERY })
    public async QueryNotificationSettings(request: ApiRequest)
    {
        this.connectionManager.Respond(request, this.notificationsManager.QuerySettings());
    }

    @ApiEndpoint({ route: Messages.NOTIFICATIONS_SET })
    public async SetSettings(request: ApiRequest, settings: NotificationSettings)
    {
        this.notificationsManager.SetSettings(settings);
        this.connectionManager.Respond(request, undefined);
    }
}

export default NotificationsApi;