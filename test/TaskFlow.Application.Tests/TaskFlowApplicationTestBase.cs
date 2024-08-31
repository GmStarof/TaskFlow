using Volo.Abp.Modularity;

namespace TaskFlow;

public abstract class TaskFlowApplicationTestBase<TStartupModule> : TaskFlowTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
