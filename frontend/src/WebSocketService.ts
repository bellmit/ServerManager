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
import { Dictionary, ObservableEvent } from "acfrontend";

export class WebSocketService
{
    constructor()
    {
        this.apiListeners = {};
        this.onOpen = new ObservableEvent();
        
        this.webSocketConnection = new WebSocket("ws://localhost:8081");

        this.webSocketConnection.onopen = () => 
        {
            this.onOpen.Emit();
        };

        this.webSocketConnection.onerror = (error) => 
        {
            throw new Error("Error from backend: " + error);
        };

        this.webSocketConnection.onmessage = this.OnMessageReceived.bind(this);
    }

    //Public methods
    public RegisterApiListenerHandler(route: string, handler: Function)
    {
        this.apiListeners[route] = handler;
    }

    public SendMessage(route: string, data: any = undefined)
    {
        if(this.webSocketConnection.readyState == 1)
        {
            this.webSocketConnection.send(JSON.stringify({ route: route, data: data }));
        }
        else
        {
            this.onOpen.Subscribe(this.SendMessage.bind(this, route, data));
        }
    }

    //Private members
    private webSocketConnection: WebSocket;
    private apiListeners: Dictionary<Function>;
    private onOpen: ObservableEvent;

    //Event handlers
    private OnMessageReceived(message: MessageEvent)
    {
        const parsedMessage = JSON.parse(message.data);
        if("route" in parsedMessage)
        {
            if(parsedMessage.route in this.apiListeners)
            {
                this.apiListeners[parsedMessage.route](parsedMessage.data);
            }
        }
    }
}