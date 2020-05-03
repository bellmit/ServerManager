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
import * as path from "path";

import { Dictionary } from "acts-util";

import { BackupTask } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ConfigManager } from "./ConfigManager";
import { CommandExecutor } from "./CommandExecutor";
import { ExternalConnectionManager } from "./ExternalConnectionManager";
import { TemporaryFilesService } from "./TemporaryFilesService";
import { ExternalConnection } from "../Model/ExternalConnection";
import { ApiSessionInfo } from "../Api";

interface BackupConfig
{
    backupTasks: BackupTask[];
}

const CONFIG_KEY = "backup";

@Injectable
export class BackupManager
{
    constructor(private cfgManager: ConfigManager, private commandExecutor: CommandExecutor, private externalConnectionManager: ExternalConnectionManager,
        private tempFilesService: TemporaryFilesService)
    {
        this.activeTasks = {};
    }

    //Properties
    public get tasks(): BackupTask[]
    {
        if(this.backupTasks === undefined)
            this.backupTasks = this.ReadConfig().backupTasks;
        return this.backupTasks;
    }

    //Public methods
    public Delete(backupName: string)
    {
        this.StopScheduler();

        if(backupName in this.activeTasks)
            throw new Error("NO");
        else
        {
            const srcIdx = this.tasks.findIndex( task => task.name === backupName );
            this.tasks.Remove(srcIdx);

            this.WriteConfig();
        }

        this.Schedule();
    }

    public ListBackupFileNames(backupName: string)
    {
        const task = this.tasks.find(t => t.name === backupName);
        if(task === undefined)
            return undefined;
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);

        return connection.ListDirectoryContents(task.path);
    }

    public ReadBackupFile(backupName: string, fileName: string)
    {
        const task = this.tasks.find(t => t.name === backupName);
        if(task === undefined)
            return undefined;
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);

        return connection.ReadFile( path.join(task.path, fileName) );
    }
    
    public async RunBackup(backupName: string, session: ApiSessionInfo)
    {
        this.StopScheduler();
        await this.IssueBackupJob( this.tasks.find(task => task.name === backupName)!, Date.now(), session);
        this.Schedule();
    }

    public SetBackup(originalName: string | undefined, backup: BackupTask)
    {
        this.StopScheduler();

        //check if target exists
        if( (originalName !== undefined) && (originalName !== backup.name) && (this.tasks.find( task => task.name === backup.name ) !== undefined) )
            return false;

        //active backups can't be changed
        if( (originalName !== undefined) && (originalName in this.activeTasks) )
            return false;

        //delete old
        if(originalName !== undefined)
        {
            const srcIdx = this.tasks.findIndex( task => task.name === originalName );
            this.tasks.Remove(srcIdx);
        }

        //set new
        this.tasks.push(backup);
        this.WriteConfig();

        this.Schedule();

        return true;
    }

    public Schedule()
    {
        this.StopScheduler();

        if(this.tasks.find(task => task.enabled && !(task.name in this.activeTasks)) !== undefined)
        {
            const delay = this.ComputeNextBackupDelay();
            this.timeoutId = setTimeout(this.OnSchedulerInterrupt.bind(this), delay);
        }
    }

    //Private members
    private activeTasks: Dictionary<boolean>;
    private backupTasks?: BackupTask[];
    private timeoutId?: NodeJS.Timeout;

    //Private methods
    private ComputeDelay(task: BackupTask)
    {
        let diff = task.nextBackupTime.valueOf() - Date.now().valueOf();
        if(diff < 0)
            diff = 0;
        return diff;
    }

    private ComputeNextBackupDelay()
    {
        let delay = Number.MAX_VALUE;
        for (let index = 0; index < this.tasks.length; index++)
        {
            const task = this.tasks[index];
            if(!task.enabled)
                continue;
            if(task.name in this.activeTasks)
                continue;

            const taskDelay = this.ComputeDelay(task);
            delay = taskDelay < delay ? taskDelay : delay;
        }
        return delay;
    }

    private ComputeNextBackupTime(task: BackupTask, thisBackupTime: number)
    {
        const lastBackupTime = task.nextBackupTime.valueOf();
        const nIntervals = Math.ceil((thisBackupTime - lastBackupTime) / 1000 / task.interval);
        task.nextBackupTime = new Date(lastBackupTime + nIntervals * task.interval * 1000);
    }

    private async DeleteOldBackups(task: BackupTask, connection: ExternalConnection)
    {
        if(task.numberOfBackupsLimit === undefined)
            return;

        const bkpFiles = (await connection.ListDirectoryContents(task.path)).map(entry => entry.fileName);
        bkpFiles.sort();

        for(let i = 0; i < bkpFiles.length - task.numberOfBackupsLimit; i++)
        {
            await connection.Delete(path.join(task.path, bkpFiles[i]));
        }
    }

    private async IssueBackupJob(task: BackupTask, now: number, session: ApiSessionInfo)
    {
        if(task.name in this.activeTasks)
            return;

        await this.PerformBackup(task, new Date(now), session);
        this.ComputeNextBackupTime(task, now);

        this.UpdateBackup(task);
    }

    private async PerformBackup(task: BackupTask, backupTime: Date, session: ApiSessionInfo)
    {
        //create directories
        const tmpDir = await this.tempFilesService.CreateTempDirectory();
        const bkpDir = path.join(tmpDir, "data");
        fs.mkdirSync(bkpDir);

        //do all steps in scope
        if("mysql" in task.scope)
        {
            await this.commandExecutor.ExecuteWaitableAsyncCommand("mysqldump -u root --all-databases > " + bkpDir + "/mysql.sql", session);
        }

        //compress to zip
        const bkpFileName = "bkp" + backupTime.toISOString() + ".zip";
        await this.commandExecutor.ExecuteWaitableAsyncCommand("zip -9 -r " + bkpFileName + " data /etc/ServerManager.json", { workingDirectory: tmpDir, gid: session.gid, uid: session.uid });

        //ensure that path exists
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);
        if(!(await connection.Exists(task.path)))
            await connection.CreateDirectoryTree(task.path);

        //pass zip to storage
        await connection.StoreFile(path.join(tmpDir, bkpFileName), path.join(task.path, bkpFileName), session);

        //cleanup
        this.tempFilesService.CleanUp(tmpDir, session);

        await this.DeleteOldBackups(task, connection);
    }

    private ReadConfig(): BackupConfig
    {
        const obj = this.cfgManager.Get<any>(CONFIG_KEY);
        if(obj === undefined)
            return {
                backupTasks: []
            };
        obj.backupTasks.forEach( (task: any) => task.nextBackupTime = new Date(task.nextBackupTime));
        return obj;
    }

    private StopScheduler()
    {
        if(this.timeoutId === undefined)
            return false;
        
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;

        return true;
    }

    private UpdateBackup(task: BackupTask)
    {
        this.SetBackup(task.name, task);
    }

    private WriteConfig()
    {
        const cfg: BackupConfig = {
            backupTasks: this.tasks
        };
        this.cfgManager.Set(CONFIG_KEY, cfg);
    }

    //Event handlers
    private OnSchedulerInterrupt()
    {
        const now = Date.now();
        for (let index = 0; index < this.tasks.length; index++)
        {
            const task = this.tasks[index];
            if( task.enabled && (now >= task.nextBackupTime.valueOf()) )
                this.IssueBackupJob(task, now, { gid: 0, uid:0 });
        }
        this.Schedule();
    }
}