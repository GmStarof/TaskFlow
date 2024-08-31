using Volo.Abp.Modularity;

namespace TaskFlow;

[DependsOn(
    typeof(TaskFlowDomainModule),
    typeof(TaskFlowTestBaseModule)
)]
public class TaskFlowDomainTestModule : AbpModule
{

}
