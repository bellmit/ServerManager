/**
 * ServerManager
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
import { ApiService, ApiListener } from "../../API/Api";
import { WebSocketService } from "../../Services/WebSocketService";

const MSG_SYSTEMUPDATE = "/SystemUpdate/";
const MSG_SYSTEMUPDATE_CHECK = MSG_SYSTEMUPDATE + "Check";

@ApiService
export class UpdateService
{
    constructor(private webSocketService: WebSocketService)
    {
    }

    //Public methods
    public CheckForUpdates()
    {
        this.webSocketService.SendMessage(MSG_SYSTEMUPDATE_CHECK);
    }

    //Api Listeners
    @ApiListener({ route: MSG_SYSTEMUPDATE_CHECK })
    private OnReceiveCheckProcessTracer()
    {
    }
}