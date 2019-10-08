export const Injector = new class
{
    //Public methods
    Register<T>(type: string, instance: T)
    {
        this.instances[type] = instance;
    }

    Resolve<T>(type: string): T
    {
        return this.instances[type] as T;
    }

    //Private members
    private instances: any = {};
}