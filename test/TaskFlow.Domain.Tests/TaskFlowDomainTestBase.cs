using Volo.Abp.Modularity;

namespace TaskFlow;

/* Inherit from this class for your domain layer tests. */
public abstract class TaskFlowDomainTestBase<TStartupModule> : TaskFlowTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
