using Volo.Abp.Modularity;

namespace TaskFlow;

[DependsOn(
    typeof(TaskFlowApplicationModule),
    typeof(TaskFlowDomainTestModule)
)]
public class TaskFlowApplicationTestModule : AbpModule
{

}
