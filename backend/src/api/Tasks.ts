/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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
import { Tasks } from "srvmgr-api";
import { WebSocketAPIEndpoint, ApiRequest } from "../Api";
import { TaskScheduler } from "../services/TaskScheduler";

@Injectable
class API
{
    constructor(private taskScheduler: TaskScheduler)
    {
    }

    @WebSocketAPIEndpoint({ route: Tasks.API.QueryScheduledTasks.message })
    public async QueryScheduledTasks(request: ApiRequest): Promise<Tasks.API.QueryScheduledTasks.ResultData>
    {
        /*
        TODO: include also:
        cron
        anacron
        systemctl list-timers --all
        */
        return this.taskScheduler.QueryScheduledTasks();
    }
}

export default API;