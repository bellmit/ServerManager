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
import { Tasks } from "srvmgr-api";

interface Task
{
    repetetive: boolean;
    nextScheduleTime: Date;
    interval: number;
    task: () => Promise<void>;
    timerId: NodeJS.Timeout;
    description: string;
}

interface DailyPattern
{
    type: "daily";
    atHour: number;
}

@Injectable
export class TaskScheduler
{
    constructor()
    {
        this.tasks = new Map<number, Task>();
        this.taskCounter = 0;
    }

    //Public methods
    public OneShot(fireTime: Date, task: () => Promise<void>, description: string)
    {
        const taskNumber = this.taskCounter++;

        const nextScheduleTime = this.ComputeNextScheduleTime(fireTime, 0);
        this.tasks.set(taskNumber, {
            repetetive: false,
            nextScheduleTime,
            interval: 0,
            task,
            timerId: this.StartClock(taskNumber, nextScheduleTime),
            description
        });

        return taskNumber;
    }

    public QueryScheduledTasks(): Tasks.TaskInfo[]
    {
        return this.tasks.Values().Map(t => {
            const info: Tasks.TaskInfo = {
                description: t.description,
                nextScheduleTime: t.nextScheduleTime.toISOString(),
                type: "ServerManager"
            };
            return info;
        }).ToArray();
    }

    public Repeat(interval: number, task: () => Promise<void>, description: string)
    {
        return this.RepeatWithStartTime(new Date(), interval, task, description);
    }

    public RepeatWithPattern(pattern: DailyPattern, task: () => Promise<void>, description: string)
    {
        const now = new Date();
        const day = now.getUTCDate() + (now.getUTCHours() < pattern.atHour ? 0 : 1);
        const nextScheduleTime = new Date(now.getUTCFullYear(), now.getUTCMonth(), day, pattern.atHour, 0, 0, 0);

        this.RepeatWithStartTime(nextScheduleTime, 24 * 60 * 60 * 1000, task, description);
    }

    public RepeatWithStartTime(startTime: Date, interval: number, task: () => Promise<void>, description: string)
    {
        const taskNumber = this.taskCounter++;

        const nextScheduleTime = this.ComputeNextScheduleTime(startTime, 0);
        this.tasks.set(taskNumber, {
            repetetive: true,
            nextScheduleTime: nextScheduleTime,
            interval: interval,
            task: task,
            timerId: this.StartClock(taskNumber, nextScheduleTime),
            description
        });

        return taskNumber;
    }

    public Stop(taskId: number)
    {
        const task = this.tasks.get(taskId);

        clearTimeout(task!.timerId);
        this.tasks.delete(taskId);
    }

    //Private members
    private tasks: Map<number, Task>;
    private taskCounter: number;

    //Private methods
    private ComputeDelay(scheduleTime: Date)
    {
        let diff = scheduleTime.valueOf() - Date.now();
        if(diff < 0)
            diff = 0;

        if(diff > 2147483647)
            diff = 2147483647;

        return diff;
    }

    private ComputeNextScheduleTime(referenceDate: Date, interval: number)
    {
        const d = new Date( referenceDate.valueOf() + interval );
        if(d.valueOf() < Date.now())
            return new Date();
        return d;
    }

    private StartClock(taskId: number, nextScheduleTime: Date)
    {
        return setTimeout(this.OnSchedulerInterrupt.bind(this, taskId), this.ComputeDelay(nextScheduleTime));
    }

    //Event handlers
    private async OnSchedulerInterrupt(taskId: number)
    {
        let task = this.tasks.get(taskId);
        if(task === undefined)
            return;
        if(task.nextScheduleTime.valueOf() < Date.now())
        {
            //clock came to early, reschedule
            task.timerId = this.StartClock(taskId, task.nextScheduleTime);
            return;
        }

        await task.task();

        task = this.tasks.get(taskId); //in the mean-time the task might have been stopped
        if(task === undefined)
            return;

        if(task.repetetive)
        {
            task.nextScheduleTime = this.ComputeNextScheduleTime(new Date(), task.interval);
            task.timerId = this.StartClock(taskId, task.nextScheduleTime);
        }
        else
            this.tasks.delete(taskId);
    }
}